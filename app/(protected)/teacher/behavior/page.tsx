"use client";
import { useState, useMemo } from "react";
import { Loader2, UserCheck, Star, History } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { useClasses } from "@/hooks/useClasses";
import { useStudents } from "@/hooks/useStudents";
import { useRecordBehavior, useBehaviorLogs } from "@/hooks/useTeacher";
import { formatClassLabel, cleanSectionName, extractUniqueClasses } from "@/lib/utils/formatClassLabel";

function formatLogDate(value: any): string {
  if (!value) return "";
  // Firestore timestamps arrive as { seconds, nanoseconds } (or _seconds)
  // after JSON serialization; plain ISO strings pass through as-is.
  const seconds = value?.seconds ?? value?._seconds;
  const d = typeof seconds === "number" ? new Date(seconds * 1000) : new Date(value);
  if (isNaN(d.getTime())) return typeof value === "string" ? value : "";
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function BehaviorPage() {
  const { data: classesData = [] } = useClasses();
  const [classGrade, setClassGrade] = useState("");
  const [section, setSection] = useState("");
  const [studentId, setStudentId] = useState("");
  const [points, setPoints] = useState(0);
  const [reason, setReason] = useState("");

  const uniqueClasses = useMemo(() => extractUniqueClasses(classesData), [classesData]);

  const { data: students = [] } = useStudents(
    classGrade && section ? { classGrade, section } : undefined
  );
  
  const recordMutation = useRecordBehavior();
  // B14 (N15) — visible history: what was actually recorded for this student.
  const { data: behaviorLogs = [], isLoading: logsLoading } = useBehaviorLogs(studentId || undefined);

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
    if (!studentId || !points || !reason) return;
    // B14 (N15) — one idempotency key per submit: a retried/double submit
    // with the same key is dropped server-side instead of recording twice.
    recordMutation.mutate({ studentId, points, reason, idempotencyKey: crypto.randomUUID() }, {
      onSuccess: () => {
        // Keep the selected student so more points can be recorded for them;
        // only clear the per-entry fields.
        setPoints(0); setReason("");
      }
    });
  };

  return (
    <RequirePermission permissions={["behavior.create" as any]}>
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2 border-b pb-4">
          <Star className="text-yellow-500" /> Behavior Points
        </h1>
        <p className="text-gray-500 text-sm">Reward or deduct behavior points for students.</p>

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

          <div className="bg-gray-50 p-4 border rounded-xl flex items-center justify-between">
            <span className="font-bold text-gray-700">Assign Points</span>
            <div className="flex items-center gap-4 bg-white border rounded-lg p-1 shadow-sm">
              <button type="button" onClick={() => setPoints(p => p - 1)} className="bg-red-50 text-red-600 hover:bg-red-100 w-10 h-10 rounded-md font-black text-xl">−</button>
              <span className={`w-12 text-center text-xl font-black ${points > 0 ? "text-green-600" : points < 0 ? "text-red-600" : "text-gray-900"}`}>{points > 0 ? `+${points}` : points}</span>
              <button type="button" onClick={() => setPoints(p => p + 1)} className="bg-green-50 text-green-600 hover:bg-green-100 w-10 h-10 rounded-md font-black text-xl">+</button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Reason</label>
            <input placeholder="e.g., Helped a classmate" value={reason} onChange={e => setReason(e.target.value)} className="w-full bg-gray-50 border rounded-xl p-3" required />
          </div>

          <button type="submit" disabled={recordMutation.isPending || !studentId || points === 0} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm">
            {recordMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <UserCheck size={18} />} Record Behavior
          </button>
        </form>

        {/* B14 (N15) — history: one row per recorded entry, so a duplicate
            (or a missing record) is visible on the page itself. */}
        {studentId && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 mb-4">
              <History className="text-blue-600" size={20} /> Behavior History
            </h2>
            {logsLoading ? (
              <p className="text-sm text-gray-400">Loading history…</p>
            ) : behaviorLogs.length === 0 ? (
              <p className="text-sm text-gray-400">No behavior points recorded for this student yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {behaviorLogs.map((log: any) => (
                  <li key={log.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{log.reason}</p>
                      <p className="text-xs text-gray-400">{formatLogDate(log.createdAt)}</p>
                    </div>
                    <span className={`text-sm font-black px-3 py-1 rounded-full ${log.points > 0 ? "bg-green-50 text-green-700" : log.points < 0 ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                      {log.points > 0 ? `+${log.points}` : log.points}
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
