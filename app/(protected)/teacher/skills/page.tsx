"use client";
import { useState, useMemo } from "react";
import { Loader2, UserCheck, Star, History } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { useClasses } from "@/hooks/useClasses";
import { useStudents } from "@/hooks/useStudents";
import { useRecordSkill, useSkills } from "@/hooks/useTeacher";
import { formatClassLabel, cleanSectionName, extractUniqueClasses, CANONICAL_SUBJECTS } from "@/lib/utils/formatClassLabel";

// Same term list as the Exams page — skills are stored per student/term/subject.
const EXAM_TERMS = ["Final Exams", "1st Term", "2nd Term", "Monthly Test", "Mock Exams", "SBA"];

export default function SkillsPage() {
  const { data: classesData = [] } = useClasses();
  const [classGrade, setClassGrade] = useState("");
  const [section, setSection] = useState("");
  const [studentId, setStudentId] = useState("");
  const [term, setTerm] = useState("1st Term");
  const [subject, setSubject] = useState("");
  const [points, setPoints] = useState(0);
  const [reason, setReason] = useState("");

  const uniqueClasses = useMemo(() => extractUniqueClasses(classesData), [classesData]);

  const { data: students = [] } = useStudents(
    classGrade && section ? { classGrade, section } : undefined
  );
  
  // B13 (N10) — record via the dedicated skills endpoint (/marks/skills).
  // The page previously posted to /behavior, so no skill was ever saved and
  // the Audit Center showed a phantom second behavior entry instead.
  const recordMutation = useRecordSkill();
  // B13 (N10) — visible history: the skills actually stored for this student.
  const { data: skillsData = [], isLoading: skillsLoading } = useSkills(studentId || undefined);
  const skillHistory = useMemo(() => {
    const rows: { skill: string; points: number }[] = [];
    for (const map of skillsData || []) {
      if (!map) continue;
      for (const [skill, pts] of Object.entries(map)) {
        rows.push({ skill, points: pts as number });
      }
    }
    return rows;
  }, [skillsData]);

  const availableSections = useMemo(() => {
    if (!classGrade) return [];
    const norm = formatClassLabel(classGrade);
    const matched = classesData.filter((c: any) => formatClassLabel(c.classGrade || c.name) === norm);
    const set = new Set<string>();
    matched.forEach((c: any) => {
      const s = cleanSectionName(c.sectionName || c.section);
      if (s) set.add(s);
    });
    return set.size > 0 ? Array.from(set).sort() : ["A", "B", "C"];
  }, [classesData, classGrade]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !points || !reason.trim() || !term || !subject) return;
    recordMutation.mutate({ studentId, term, subject, skills: { [reason.trim()]: points } }, {
      onSuccess: () => {
        // B13 (N10) — the selected student must persist through submit;
        // only clear the per-entry fields.
        setPoints(0); setReason("");
      }
    });
  };

  return (
    <RequirePermission permissions={["skills.create" as any]}>
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2 border-b pb-4">
          <Star className="text-yellow-500" /> Student Skills & Achievements
        </h1>
        <p className="text-gray-500 text-sm">Award new skill points to students.</p>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Class</label>
              <select value={classGrade} onChange={e => { setClassGrade(e.target.value); setSection(""); setStudentId(""); }} className="w-full bg-gray-50 border rounded-xl p-3" required>
                <option value="">Select Class</option>
                {uniqueClasses.map((cls: string) => <option key={cls} value={cls}>{cls}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Section</label>
              <select value={section} onChange={e => { setSection(e.target.value); setStudentId(""); }} className="w-full bg-gray-50 border rounded-xl p-3 disabled:opacity-50" required disabled={!classGrade}>
                <option value="">Select Section</option>
                {availableSections.map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Student</label>
            <select value={studentId} onChange={e => setStudentId(e.target.value)} className="w-full bg-gray-50 border rounded-xl p-3 disabled:opacity-50" required disabled={!section}>
              <option value="">Select Student</option>
              {students.map((s: any) => <option key={s.id} value={s.id}>{s.fullName || s.name} ({s.rollNumber})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Term</label>
              <select value={term} onChange={e => setTerm(e.target.value)} className="w-full bg-gray-50 border rounded-xl p-3" required>
                {EXAM_TERMS.map((t: string) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-gray-50 border rounded-xl p-3" required>
                <option value="">Select Subject</option>
                {CANONICAL_SUBJECTS.map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-gray-50 p-4 border rounded-xl flex items-center justify-between">
            <span className="font-bold text-gray-700">Assign Points</span>
            <div className="flex items-center gap-4 bg-white border rounded-lg p-1 shadow-sm">
              <button type="button" onClick={() => setPoints(p => p - 1)} className="bg-red-50 text-red-600 hover:bg-red-100 w-10 h-10 rounded-md font-black text-xl">−</button>
              <span className={`w-12 text-center text-xl font-black ${points > 0 ? "text-green-600" : points < 0 ? "text-red-600" : "text-gray-900"}`}>{points > 0 ? `+${points}` : points}</span>
              <button type="button" onClick={() => setPoints(p => p + 1)} className="bg-green-50 text-green-600 hover:bg-green-100 w-10 h-10 rounded-md font-black text-xl">+</button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Skill / Achievement</label>
            <input placeholder="e.g., Led the science project" value={reason} onChange={e => setReason(e.target.value)} className="w-full bg-gray-50 border rounded-xl p-3" required />
          </div>

          <button type="submit" disabled={recordMutation.isPending || !studentId || points === 0 || !reason.trim() || !term || !subject} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm">
            {recordMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <UserCheck size={18} />} Record Skill
          </button>
        </form>

        {/* B13 (N10) — history: the skills actually stored for this student. */}
        {studentId && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 mb-4">
              <History className="text-blue-600" size={20} /> Skills History
            </h2>
            {skillsLoading ? (
              <p className="text-sm text-gray-400">Loading history…</p>
            ) : skillHistory.length === 0 ? (
              <p className="text-sm text-gray-400">No skills recorded for this student yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {skillHistory.map((row, idx) => (
                  <li key={`${row.skill}-${idx}`} className="py-3 flex items-center justify-between gap-4">
                    <p className="text-sm font-bold text-gray-800">{row.skill}</p>
                    <span className={`text-sm font-black px-3 py-1 rounded-full ${row.points > 0 ? "bg-green-50 text-green-700" : row.points < 0 ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                      {row.points > 0 ? `+${row.points}` : row.points}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </RequirePermission>
  );
}
