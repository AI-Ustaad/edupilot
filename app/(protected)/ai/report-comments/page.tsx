"use client";

import { useState } from "react";
import { Loader2, FileText } from "lucide-react";

export default function ReportCommentsPage() {
  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [marks, setMarks] = useState("");
  const [attendance, setAttendance] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !grade || !subject || !marks || !attendance) return;
    setLoading(true);
    setComment("");

    try {
      const res = await fetch("/api/ai/report-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          grade,
          subject,
          marks: parseInt(marks),
          attendance: parseInt(attendance),
        }),
      });
      const json = await res.json();
      setComment(json.data?.comment || json.comment || "Could not generate comment.");
    } catch (err) {
      setComment("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText size={32} className="text-green-600" />
        <h1 className="text-2xl font-black text-gray-900">AI Report Comments</h1>
      </div>

      <form onSubmit={generate} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input placeholder="Student Name" value={studentName} onChange={e => setStudentName(e.target.value)} className="border border-gray-300 rounded-xl p-3" required />
          <input placeholder="Grade" value={grade} onChange={e => setGrade(e.target.value)} className="border border-gray-300 rounded-xl p-3" required />
          <input placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} className="border border-gray-300 rounded-xl p-3" required />
          <input placeholder="Marks (%)" type="number" value={marks} onChange={e => setMarks(e.target.value)} className="border border-gray-300 rounded-xl p-3" required />
          <input placeholder="Attendance (%)" type="number" value={attendance} onChange={e => setAttendance(e.target.value)} className="border border-gray-300 rounded-xl p-3" required />
        </div>
        <button type="submit" disabled={loading} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
          {loading ? <Loader2 className="animate-spin" size={18} /> : "Generate Comment"}
        </button>
      </form>

      {comment && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-bold text-gray-800 mb-2">Generated Comment</h2>
          <p className="text-gray-700">{comment}</p>
        </div>
      )}
    </div>
  );
}
