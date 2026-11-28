import { GeminiProvider } from "@/lib/ai/providers/GeminiProvider";
import { UsageTracker } from "@/lib/ai/monitoring/UsageTracker";
import type { IAITimetableService } from "@/interfaces/IAITimetableService";
import { CANONICAL_SUBJECTS, canonicalizeSubject } from "@/lib/utils/formatClassLabel";

interface TimetableRequest {
  classes: string[];
  days: string[];
  periods: number;
  subjects: string[];
  teachers: string[];
  /** Optional roster grounding: teacher display name -> subjects they are rostered to teach. */
  teacherSubjects?: Record<string, string[]>;
}

interface TeacherIndexEntry {
  displayName: string;
  /** Lowercase canonical subjects this teacher is rostered for. */
  subjects: Set<string>;
}

/**
 * Build a case-insensitive lookup of rostered subjects per teacher name.
 * Teachers absent from the map (e.g. free-text names with no roster record)
 * simply have no rostered subjects.
 */
function buildTeacherIndex(teacherSubjects?: Record<string, string[]>): Map<string, TeacherIndexEntry> {
  const index = new Map<string, TeacherIndexEntry>();
  if (!teacherSubjects) return index;
  for (const [name, subjects] of Object.entries(teacherSubjects)) {
    const trimmed = String(name || "").trim();
    if (!trimmed) continue;
    const set = new Set<string>();
    for (const s of subjects || []) {
      const canonical = canonicalizeSubject(s);
      if (canonical) set.add(canonical.toLowerCase());
    }
    index.set(trimmed.toLowerCase(), { displayName: trimmed, subjects: set });
  }
  return index;
}

/** Teachers (from the provided list) rostered for a subject, in provided order. */
function qualifiedTeachersForSubject(
  subject: string,
  teachers: string[],
  index: Map<string, TeacherIndexEntry>
): string[] {
  const subjectKey = canonicalizeSubject(subject).toLowerCase();
  if (!subjectKey) return [];
  return teachers.filter((t) => {
    const entry = index.get(String(t || "").trim().toLowerCase());
    return entry ? entry.subjects.has(subjectKey) : false;
  });
}

/**
 * Pick a teacher for one subject slot.
 * Preference order: (1) a teacher rostered for the subject who is not already
 * booked at this day+period, round-robin for spread; (2) any unbooked provided
 * teacher; (3) a rostered teacher even if booked; (4) any provided teacher.
 * Never invents a name — always one of the provided teachers (or "" if none).
 */
function pickTeacherForSubject(
  subject: string,
  teachers: string[],
  index: Map<string, TeacherIndexEntry>,
  booked: Set<string>,
  counters: Map<string, number>
): string {
  const subjectKey = canonicalizeSubject(subject).toLowerCase();
  const qualified = qualifiedTeachersForSubject(subject, teachers, index);
  const unbooked = (list: string[]) =>
    list.filter((t) => !booked.has(String(t || "").trim().toLowerCase()));
  const pickRoundRobin = (list: string[]) => {
    if (list.length === 0) return "";
    const n = counters.get(subjectKey) ?? 0;
    const chosen = list[n % list.length];
    counters.set(subjectKey, n + 1);
    return chosen;
  };
  return (
    pickRoundRobin(unbooked(qualified)) ||
    pickRoundRobin(unbooked(teachers)) ||
    pickRoundRobin(qualified) ||
    pickRoundRobin(teachers) ||
    ""
  );
}

/** Requested subjects, canonicalized and deduplicated (preserving request order). */
function requestedSubjects(req: TimetableRequest): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const s of req.subjects || []) {
    const canonical = canonicalizeSubject(s);
    if (!canonical) continue;
    const key = canonical.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(canonical);
    }
  }
  return result;
}

export class TimetableService implements IAITimetableService {
  private provider: GeminiProvider;
  private usageTracker: UsageTracker;

  constructor(provider?: GeminiProvider, usageTracker?: UsageTracker) {
    this.provider = provider ?? new GeminiProvider();
    this.usageTracker = usageTracker ?? new UsageTracker();
  }

  generateDeterministicFallbackSchedule(req: TimetableRequest): any[] {
    const days = req.days && req.days.length > 0 ? req.days : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const classes = req.classes && req.classes.length > 0 ? req.classes : ["Class 10"];
    const periods = Number(req.periods) || 8;
    // N23: never discard a non-empty subject selection. Only when the caller
    // requests no subjects at all do we fall back to the canonical list.
    // (Previously any request with fewer than 5 subjects was silently replaced
    // with all 11 canonical subjects — "English only" generated 8 subjects.)
    const selected = requestedSubjects(req);
    const subjects = selected.length > 0 ? selected : CANONICAL_SUBJECTS;
    const teachers = req.teachers && req.teachers.length > 0 ? req.teachers : [
      "Ghzandar Ali", "Fahad Siddiqui", "Hamza Nawaz", "Hassan Hussain", "Hamza Khan", "Bilal Sheikh", "Ali Ansari", "Usman Haider", "Iqra Qureshi", "STF-002"
    ];
    const teacherIndex = buildTeacherIndex(req.teacherSubjects);
    const counters = new Map<string, number>();

    const schedule: any[] = [];
    days.forEach((day, dayIdx) => {
      for (let p = 1; p <= periods; p++) {
        const isBreak = p === 4; // Period 4 is explicit Break / Recess
        const booked = new Set<string>();

        classes.forEach((cls, clsIdx) => {
          if (isBreak) {
            schedule.push({
              day,
              period: String(p),
              subject: "Break / Recess",
              classGrade: cls,
              class: cls,
              teacher: "Duty Staff",
            });
            return;
          }

          // Offset academic subjects to cycle through the REQUESTED subjects
          const academicPeriodIndex = p > 4 ? p - 2 : p - 1;
          const subIdx = (academicPeriodIndex + dayIdx * 2 + clsIdx * 3) % subjects.length;
          const subject = subjects[subIdx];

          // N23: assign a teacher rostered for this subject (never one teacher
          // for every subject), and never double-book a teacher at one slot.
          const teacher = pickTeacherForSubject(subject, teachers, teacherIndex, booked, counters);
          booked.add(String(teacher || "").trim().toLowerCase());

          schedule.push({
            day,
            period: String(p),
            subject,
            classGrade: cls,
            class: cls,
            teacher,
          });
        });
      }
    });

    return schedule;
  }

  async generateTimetable(req: TimetableRequest, tenantId?: string, userId?: string): Promise<any[]> {
    if (tenantId) {
      await this.usageTracker.checkQuota(tenantId).catch(() => {});
    }

    const startTime = Date.now();
    try {
      const teacherIndex = buildTeacherIndex(req.teacherSubjects);
      const selected = requestedSubjects(req);
      // N23: tell the AI exactly which provided teachers are qualified for
      // each requested subject, so it cannot assign one teacher to everything.
      const qualificationLines = selected
        .map((subject) => {
          const qualified = qualifiedTeachersForSubject(subject, req.teachers || [], teacherIndex);
          return qualified.length > 0 ? `- ${subject}: ${qualified.join(", ")}` : null;
        })
        .filter(Boolean) as string[];
      const qualificationBlock =
        qualificationLines.length > 0
          ? `\n        - Subject -> qualified teachers (assign each subject ONLY a teacher listed as qualified for it; if a subject has no qualified teacher listed, use any of the provided teachers):\n        ${qualificationLines.join("\n        ")}\n        - Never assign a teacher to a subject they are not qualified for.\n        - Never invent teacher names: use ONLY the teachers listed above.\n`
          : "";

      const prompt = `
        Generate a valid JSON array representing a weekly school timetable. Do not include any other text, explanation, or markdown formatting such as \`\`\`json.

        Requirements:
        - Classes: ${(req.classes || []).join(", ")}
        - Days: ${(req.days || []).join(", ")}
        - Periods per day: ${req.periods || 8}
        - Subjects: ${(req.subjects || []).join(", ")}
        - Teachers: ${(req.teachers || []).join(", ")}
        - Period 4 is mandatory Break / Recess across all classes with teacher "Duty Staff".
        - Conflict-free teacher allocation: no teacher may be assigned to more than one class at the same period and day.
${qualificationBlock}
        Each entry must have exactly these keys: "day", "period", "subject", "classGrade", "teacher".
        The period should be a string representing the period (e.g., "1", "2", "3...").
        Ensure the JSON is valid and complete. Return ONLY the JSON array.
      `;

      const response = await this.provider.generateContent(
        prompt,
        undefined,
        undefined,
        { responseMimeType: "application/json" }
      );
      const text = response?.text || "";

      let cleaned = text.trim();
      const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        cleaned = codeBlockMatch[1].trim();
      } else {
        cleaned = cleaned.replace(/```json|```/g, "").trim();
      }

      // If array is surrounded by extraneous text, isolate array bounds
      const firstBracket = cleaned.indexOf("[");
      const lastBracket = cleaned.lastIndexOf("]");
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        cleaned = cleaned.slice(firstBracket, lastBracket + 1);
      }

      const parsed = JSON.parse(cleaned);
      const list = Array.isArray(parsed) ? parsed : (parsed.timetable || parsed.entries || parsed.items || []);
      if (!Array.isArray(list) || list.length === 0) {
        throw new Error("Empty timetable returned by AI");
      }

      // Normalize entries to strictly adhere to CreateTimetableEntrySchema
      const timetable = list.map((entry: any) => {
        const p = String(entry.period ?? "");
        const isBreak = p === "4" || String(entry.subject || "").toLowerCase().includes("break") || String(entry.subject || "").toLowerCase().includes("recess");
        return {
          ...entry,
          classGrade: String(entry.classGrade || entry.class || ""),
          class: String(entry.class || entry.classGrade || ""),
          period: p,
          subject: isBreak ? "Break / Recess" : String(entry.subject ?? ""),
          teacher: isBreak ? "Duty Staff" : String(entry.teacher ?? ""),
          day: String(entry.day ?? ""),
        };
      });

      // N23: repair AI output that ignores subject qualification — if the AI
      // assigned a teacher who is not rostered for the subject while a
      // qualified teacher exists, reassign deterministically. Breaks keep
      // "Duty Staff" and are never repaired.
      const counters = new Map<string, number>();
      const bookedBySlot = new Map<string, Set<string>>();
      for (const entry of timetable) {
        if (entry.subject === "Break / Recess") continue;
        const slotKey = `${String(entry.day || "").toLowerCase()}|${entry.period}`;
        let booked = bookedBySlot.get(slotKey);
        if (!booked) {
          booked = new Set<string>();
          bookedBySlot.set(slotKey, booked);
        }
        const subjectKey = canonicalizeSubject(entry.subject).toLowerCase();
        const teacherName = String(entry.teacher || "").trim();
        const teacherEntry = teacherIndex.get(teacherName.toLowerCase());
        const isQualified = !!teacherEntry && subjectKey !== "" && teacherEntry.subjects.has(subjectKey);
        const qualified = qualifiedTeachersForSubject(entry.subject, req.teachers || [], teacherIndex);
        if ((!teacherName || !isQualified) && qualified.length > 0) {
          const replacement = pickTeacherForSubject(entry.subject, req.teachers || [], teacherIndex, booked, counters);
          if (replacement) entry.teacher = replacement;
        }
        booked.add(String(entry.teacher || "").trim().toLowerCase());
      }

      if (tenantId && userId) {
        await this.usageTracker.track({
          tenantId,
          userId,
          provider: this.provider.name,
          model: this.provider.getConfig().model,
          tokens: response.tokensUsed ?? 0,
          latencyMs: Date.now() - startTime,
          success: true,
          documentType: "timetable-generation",
        }).catch(() => {});
      }

      return timetable;
    } catch {
      // Deterministic structured fallback schedule ensures /ai-timetable NEVER fails
      const fallbackSchedule = this.generateDeterministicFallbackSchedule(req);

      if (tenantId && userId) {
        await this.usageTracker.track({
          tenantId,
          userId,
          provider: this.provider.name,
          model: this.provider.getConfig().model,
          tokens: 0,
          latencyMs: Date.now() - startTime,
          success: true,
          documentType: "timetable-generation",
        }).catch(() => {});
      }

      return fallbackSchedule;
    }
  }
}
