"use client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function BehaviorPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [classGrade, setClassGrade] = useState("");
  const [section, setSection] = useState("");
  const [studentId, setStudentId] = useState("");
  const [points, setPoints] = useState(0);
  const [reason, setReason] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(d => {
        setClasses(d.classes || []);
        setSubjects(d.subjects || []);
      });
  }, []);

  useEffect(() => {
    if (!classGrade || !section) return;
    fetch(`/api/students?classGrade=${classGrade}&section=${section}`)
      .then(r => r.json())
      .then(d => setStudents(d.data || d));
  }, [classGrade, section]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !points || !reason) return;
    setSaving(true);
    await fetch("/api/behavior", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, points, reason }),
    });
    setSaving(false);
    setStudentId("");
    setPoints(0);
    setReason("");
  };

  const selectedSections = classes.find(c => c.name === classGrade)?.sections || [];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Behavior Points</h1>
      <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select value={classGrade} onChange={e => { setClassGrade(e.target.value); setSection(""); }} className="border rounded-xl p-2" required>
            <option value="">Select Class</option>
            {classes.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
          <select value={section} onChange={e => setSection(e.target.value)} className="border rounded-xl p-2" required disabled={!classGrade}>
            <option value="">Select Section</option>
            {selectedSections.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <select value={studentId} onChange={e => setStudentId(e.target.value)} className="border rounded-xl p-2 w-full" required disabled={!section}>
          <option value="">Select Student</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.rollNumber})</option>)}
        </select>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setPoints(p => p - 1)} className="bg-gray-200 px-3 py-1 rounded">−</button>
          <span className="text-xl font-bold">{points}</span>
          <button type="button" onClick={() => setPoints(p => p + 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
        </div>
        <input placeholder="Reason" value={reason} onChange={e => setReason(e.target.value)} className="border rounded-xl p-2 w-full" required />
        <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">
          {saving ? <Loader2 className="animate-spin" size={18} /> : "Record Behavior"}
        </button>
      </form>
    </div>
  );
}
