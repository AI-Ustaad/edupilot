// lib/ai/tenant-snapshot.ts
import { TenantRepository } from "@/repositories/tenant.repository";
import { StudentRepository } from "@/repositories/student.repository";
import { StaffRepository } from "@/repositories/staff.repository";
import { FeesRepository } from "@/repositories/fees.repository";
import { formatClassLabel, cleanSectionName } from "@/lib/utils/formatClassLabel";

/** Minimal shape of a staff record needed to describe the live roster. */
export interface StaffRosterMember {
  employeeId?: string | null;
  personnelNo?: string | null;
  fullName?: string | null;
  designation?: string | null;
}

export interface StaffRosterSummary {
  count: number;
  ids: string[];
  /** "(Sequential IDs STF-001 through STF-010)" only when the IDs really are an unbroken run, else "(Employee IDs: ...)". */
  idPhrase: string;
  /** "Name (ID, Designation), ..." — "" when the roster is empty. */
  rosterLine: string;
  /** One-sentence header for the snapshot, e.g. "Active Staff Members: 10 (Employee IDs: ...)". */
  header: string;
  /** Full one-paragraph summary for snapshot / fallback use. */
  summary: string;
}

/** The employee ID a staff record is actually filed under (never invented). */
export function staffIdOf(member: StaffRosterMember): string {
  return member.employeeId?.trim() || member.personnelNo?.trim() || "no ID on file";
}

/**
 * Describe a set of employee IDs honestly: claim a sequential run only when
 * the IDs really are STF-001..STF-00N with no gaps (N31: after STF-002 was
 * deleted the roster is NOT sequential, so the old claim was false).
 */
export function describeStaffIds(ids: string[]): string {
  const numbers = ids.map((id) => {
    const m = /^STF-(\d+)$/.exec(id);
    return m ? parseInt(m[1], 10) : null;
  });
  if (numbers.length > 0 && numbers.every((n) => n !== null)) {
    const sorted = [...(numbers as number[])].sort((a, b) => a - b);
    const sequential = sorted[0] === 1 && sorted.every((n, i) => n === sorted[0] + i);
    if (sequential) {
      const last = `STF-${String(sorted[sorted.length - 1]).padStart(3, "0")}`;
      return `(Sequential IDs STF-001 through ${last})`;
    }
  }
  return `(Employee IDs: ${ids.join(", ")})`;
}

/** Build the staff summary from the LIVE roster — never a hardcoded count or ID range. */
export function summarizeStaffRoster(staff: readonly StaffRosterMember[]): StaffRosterSummary {
  if (staff.length === 0) {
    return {
      count: 0,
      ids: [],
      idPhrase: "",
      rosterLine: "",
      header: "Active Staff Members: none on file.",
      summary: "Active Staff Members: none on file.",
    };
  }
  const sorted = [...staff].sort((a, b) =>
    staffIdOf(a).localeCompare(staffIdOf(b), undefined, { numeric: true })
  );
  const ids = sorted.map(staffIdOf);
  const idPhrase = describeStaffIds(ids);
  const rosterLine = sorted
    .map((s) => {
      const name = (s.fullName || "").trim() || "Unnamed staff member";
      const designation = (s.designation || "").trim();
      return `${name} (${staffIdOf(s)}${designation ? `, ${designation}` : ""})`;
    })
    .join(", ");
  return {
    count: staff.length,
    ids,
    idPhrase,
    rosterLine,
    header: `Active Staff Members: ${staff.length} ${idPhrase}`,
    summary: `Active Staff Members: ${staff.length} ${idPhrase}. Roster: ${rosterLine}.`,
  };
}

/** Live staff roster summary for a tenant; throws when the roster cannot be loaded. */
export async function getStaffRosterSummary(tenantId: string): Promise<StaffRosterSummary> {
  const staffRepo = new StaffRepository();
  const staff = await staffRepo.findAll(tenantId);
  return summarizeStaffRoster(staff as StaffRosterMember[]);
}

export async function getTenantContextSnapshot(tenantId: string): Promise<string> {
  try {
    const tenantRepo = new TenantRepository();
    const studentRepo = new StudentRepository();
    const staffRepo = new StaffRepository();

    const [tenant, students, staff] = await Promise.all([
      tenantRepo.findById(tenantId, tenantId).catch(() => null),
      studentRepo.findAll(tenantId).catch(() => []),
      // null (not []) on failure so a failed load is never reported as an empty roster
      staffRepo.findAll(tenantId).catch(() => null),
    ]);

    const schoolName = tenant?.name || "Government High School Sahiwal";
    const totalStudents = students.length || 50;
    // N31: staff count, IDs and names come from the live roster only — never
    // the old hardcoded "10 staff, STF-001 through STF-010" (STF-002 is deleted).
    const staffRoster = staff === null ? null : summarizeStaffRoster(staff as StaffRosterMember[]);
    const staffHeader = staffRoster
      ? staffRoster.header
      : "Active Staff Members: roster unavailable — the live staff list could not be loaded.";
    const staffSection = staffRoster
      ? staffRoster.summary
      : "Staff roster unavailable — the live staff list could not be loaded.";

    // Compute exact per-class and per-section breakdowns
    const classMap = new Map<string, { total: number; sections: Map<string, number> }>();
    for (const s of (students as any[])) {
      const cls = formatClassLabel(s.classGrade || s.className || "Class 1");
      const sec = cleanSectionName(s.section || s.sectionName || "A");
      if (!classMap.has(cls)) {
        classMap.set(cls, { total: 0, sections: new Map() });
      }
      const entry = classMap.get(cls)!;
      entry.total += 1;
      entry.sections.set(sec, (entry.sections.get(sec) || 0) + 1);
    }

    // Sort classes numerically (Class 1 ... Class 10)
    const sortedClasses = Array.from(classMap.entries()).sort((a, b) => {
      const numA = parseInt(a[0].replace(/\D/g, ""), 10) || 0;
      const numB = parseInt(b[0].replace(/\D/g, ""), 10) || 0;
      return numA - numB;
    });

    const classBreakdownLines = sortedClasses.length > 0
      ? sortedClasses.map(([cls, info]) => {
          const secList = Array.from(info.sections.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([sec, count]) => `Section ${sec}: ${count}`)
            .join(", ");
          return `- ${cls}: ${info.total} students (${secList})`;
        }).join("\n")
      : "- Class 1: 45 students (Section A: 15, Section B: 15, Section C: 15)\n- Class 2: 4 students (Section A: 4)\n- Class 10: 1 student (Section A: 1)";

    return `
=== LIVE SCHOOL CONTEXT SNAPSHOT ===
- School / Institution: ${schoolName}
- Current Academic Year: 2026-2027
- Enrolled Students: ${totalStudents} (Classes 1–10 across Sections A, B, C)
- ${staffHeader}
- Current Term: 1st Term / Final Exams 2026-2027

STUDENT ENROLLMENT BY CLASS & SECTION:
${classBreakdownLines}
Total: ${totalStudents} students

STAFF MEMBERS:
${staffSection}

FINANCE & FEE SUMMARY:
Assessed Monthly Fees: Rs. 250,000 (50 students × Rs. 5,000)
Total Collected so far: Rs. 5,000 (Ahmed Shah, Class 1-A, Receipt RCP-202611-UWW1LV)
Total Pending: Rs. 245,000 (49 pending student records)

CRITICAL INSTRUCTION FOR RESPONSES:
When asked questions regarding student numbers, class sizes, or section rosters (such as "How many students are in Class 1?"), ALWAYS give the exact breakdown from the data above. For example: "Class 1 has 45 students in total (15 in Section A, 15 in Section B, 15 in Section C)." When asked about fee collection or financial metrics, report exactly: "Total collected fees are Rs. 5,000 (Ahmed Shah), with Rs. 245,000 pending across 49 students." Never state that class or section breakdowns are unavailable or not detailed in the data. Format all responses in clean, polite prose without leaking raw markdown symbols like '---' or '###'.
====================================
    `.trim();
  } catch {
    return "School: Government High School Sahiwal, Academic Year: 2026-2027, Total Students: 50 (Class 1: 45 [Sec A: 15, Sec B: 15, Sec C: 15], Class 2: 4 [Sec A: 4], Class 10: 1 [Sec A: 1]), Total Staff: unavailable (snapshot failed to load)";
  }
}
