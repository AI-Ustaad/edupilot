"use client";
import { useState, useEffect } from "react";
import { Loader2, UserCheck, Star } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { useClasses } from "@/hooks/useClasses";
import { useStudents } from "@/hooks/useStudents";
import { useRecordBehavior } from "@/hooks/useTeacher";

export default function BehaviorPage() {
  const { data: classesData = [] } = useClasses();
  const [classGrade, setClassGrade] = useState("");
  const [section, setSection] = useState("");
  const [studentId, setStudentId] = useState("");
  const [points, setPoints] = useState(0);
  const [reason, setReason] = useState("");

  const { data: students = [] } = useStudents(
    classGrade && section ? { classGrade, section } : undefined
  );
  
  const recordMutation = useRecordBehavior();

  const availableSections = classesData.filter((c: any) => c.classGrade === classGrade).map((c: any) => c.sectionName || c.section);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !points || !reason) return;
    recordMutation.mutate({ studentId, points, reason }, {
      onSuccess: () => {
        setStudentId(""); setPoints(0); setReason("");
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
                {classesData.map((c: any) => <option key={c.id} value={c.classGrade}>{c.classGrade}</option>)}
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
      </div>
    </RequirePermission>
  );
}
