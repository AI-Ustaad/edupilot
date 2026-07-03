"use client";
import { useState } from "react";
import { Loader2, FileText, Sparkles, CheckCircle2 } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useGenerateReportComments } from "@/hooks/useAI";

export default function ReportCommentsPage() {
  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [marks, setMarks] = useState("");
  const [attendance, setAttendance] = useState("");
  const [comment, setComment] = useState("");
  
  const generateMutation = useGenerateReportComments();

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !grade || !subject || !marks || !attendance) return;
    setComment("");
    
    generateMutation.mutate(
      { studentName, grade, subject, marks: parseInt(marks), attendance: parseInt(attendance) },
      {
        onSuccess: (data) => setComment(data?.comment || "Could not generate comment."),
        onError: () => setComment("Network error or AI service unavailable."),
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <FileText size={32} className="text-green-600" />
        <div>
          <h1 className="text-2xl font-black text-gray-900">AI Report Comments</h1>
          <p className="text-gray-500 text-sm">Automatically generate personalized remarks for student report cards.</p>
        </div>
      </div>

      <form onSubmit={generate} className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input placeholder="Student Name" value={studentName} onChange={e => setStudentName(e.target.value)} className="border border-gray-300 bg-gray-50 rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none" required />
          <input placeholder="Class / Grade" value={grade} onChange={e => setGrade(e.target.value)} className="border border-gray-300 bg-gray-50 rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none" required />
          <input placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} className="border border-gray-300 bg-gray-50 rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none" required />
          <input placeholder="Marks (%)" type="number" value={marks} onChange={e => setMarks(e.target.value)} className="border border-gray-300 bg-gray-50 rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none" required />
          <input placeholder="Attendance (%)" type="number" value={attendance} onChange={e => setAttendance(e.target.value)} className="border border-gray-300 bg-gray-50 rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none" required />
        </div>
        
        <RequirePermission permissions={[PERMISSIONS.exams.manage]}>
          <button type="submit" disabled={generateMutation.isPending} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50">
            {generateMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {generateMutation.isPending ? "Generating..." : "Generate AI Comment"}
          </button>
        </RequirePermission>
      </form>

      {comment && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 shadow-inner animate-fade-in">
          <h2 className="font-black text-green-800 mb-2 flex items-center gap-2"><CheckCircle2 size={20} /> Generated Comment</h2>
          <p className="text-green-900 leading-relaxed font-medium">{comment}</p>
        </div>
      )}
    </div>
  );
}
