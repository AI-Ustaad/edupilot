"use client";
import { useEffect, useState } from "react";
import { Loader2, PlusCircle, MinusCircle, Save } from "lucide-react";

export default function TeacherBehaviorPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [points, setPoints] = useState(1);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/students")
      .then(res => res.json())
      .then(data => setStudents(Array.isArray(data) ? data : []));
  }, []);

  const handleSubmit = async () => {
    if (!selectedStudentId || !reason.trim()) {
      alert("Please select a student and provide a reason.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/behavior", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId,
          points: points,
          reason: reason.trim(),
        }),
      });
      if (res.ok) {
        setSuccess("Behavior points added successfully!");
        setTimeout(() => setSuccess(""), 3000);
        setReason("");
        setPoints(1);
      } else {
        const err = await res.json();
        alert("Error: " + (err.message || "Failed"));
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
        <PlusCircle className="text-blue-600" /> Behavior Points
      </h1>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-sm font-bold text-gray-700 mb-1 block">Student</label>
          <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} className={inputClass}>
            <option value="">Select Student</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.fullName || s.name} ({s.classGrade})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-bold text-gray-700 mb-1 block">Points</label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPoints(prev => Math.max(-10, prev - 1))}
              className="bg-red-100 text-red-600 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold hover:bg-red-200 transition"
            >
              −
            </button>
            <span className="text-3xl font-black text-gray-900 w-16 text-center">{points > 0 ? "+" : ""}{points}</span>
            <button
              onClick={() => setPoints(prev => Math.min(10, prev + 1))}
              className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold hover:bg-green-200 transition"
            >
              +
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Use positive for reward, negative for discipline.</p>
        </div>

        <div>
          <label className="text-sm font-bold text-gray-700 mb-1 block">Reason</label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g., Completed all homework on time"
            rows={3}
            className={inputClass}
          />
        </div>

        {success && <div className="bg-green-50 text-green-700 p-3 rounded-xl">{success}</div>}

        <button onClick={handleSubmit} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition">
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {saving ? "Saving..." : "Record Behavior"}
        </button>
      </div>
    </div>
  );
}
