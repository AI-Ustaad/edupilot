"use client";
import { useState } from "react";
import Link from "next/link";
import { Loader2, FileText, Sparkles, CheckCircle2, Save, AlertTriangle, ArrowRight, Zap } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useStudents } from "@/hooks/useStudents";
import { useGenerateReportComments } from "@/hooks/useAI";
import { useToast } from "@/components/ToastProvider";
import apiClient from "@/lib/api/client";

export default function ReportCommentsPage() {
  const { data: students = [] } = useStudents();
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [marks, setMarks] = useState("");
  const [attendance, setAttendance] = useState("");
  const [comment, setComment] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const { showToast } = useToast();
  
  const generateMutation = useGenerateReportComments();

  const selectedStudent = students.find((s: any) => s.id === selectedStudentId);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !marks || !attendance) return;
    setComment("");
    setErrorMessage("");
    setIsQuotaExceeded(false);
    
    generateMutation.mutate(
      { 
        studentName: selectedStudent?.fullName || "Student", 
        grade: selectedStudent?.classGrade || "N/A", 
        subject: "Overall Performance", 
        marks: parseInt(marks), 
        attendance: parseInt(attendance) 
      },
      {
        onSuccess: (data: any) => setComment(data?.comment || "Could not generate comment."),
        onError: (err: any) => {
          const errorData = err?.response?.data;
          if (err?.response?.status === 429 || errorData?.error === "RATE_LIMIT_EXCEEDED") {
            const seconds = errorData?.retryAfterSeconds || 60;
            setErrorMessage(`Rate limit reached: Too many AI requests. Please wait ${seconds} seconds before trying again.`);
          } else if (err?.response?.status === 402 || errorData?.error === "AI_QUOTA_EXCEEDED") {
            setIsQuotaExceeded(true);
            setErrorMessage(errorData?.message || "Monthly AI quota reached for your current plan. Please upgrade your subscription to unlock more capacity.");
          } else {
            setErrorMessage(errorData?.message || "Network error or AI service unavailable.");
          }
        },
      }
    );
  };

  const saveComment = async () => {
    if (!selectedStudentId || !comment) return;
    try {
      await apiClient.put(`/students/${selectedStudentId}/comment`, { comment });
      showToast("Comment saved to student profile!", "success");
    } catch (err) {
      showToast("Failed to save comment.", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <FileText size={32} className="text-green-600" />
        <div>
          <h1 className="text-2xl font-black text-gray-900">AI Report Comments</h1>
         <p className="text-gray-500 text-sm">Generate personalized remarks and save them directly to the student profile.</p>
        </div>
      </div>

      {/* Error / Quota Alert Banner */}
      {errorMessage && (
        <div className={`p-5 rounded-2xl border flex items-start gap-4 ${isQuotaExceeded ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <AlertTriangle className={isQuotaExceeded ? 'text-amber-600' : 'text-red-600'} size={24} />
          <div className="flex-1 space-y-2">
            <p className="font-bold text-sm">{errorMessage}</p>
            {isQuotaExceeded && (
              <Link
                href="/settings/billing"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <Zap size={14} /> Upgrade Subscription <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      )}

      <form onSubmit={generate} className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 space-y-5">
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-1">Select Student *</label>
          <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50" required>
            <option value="">Select a student...</option>
            {students.map((s: any) => <option key={s.id} value={s.id}>{s.fullName} (Class {s.classGrade})</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input placeholder="Average Marks (%)" type="number" value={marks} onChange={e => setMarks(e.target.value)} className="border border-gray-300 bg-gray-50 rounded-xl p-3" required />
          <input placeholder="Attendance (%)" type="number" value={attendance} onChange={e => setAttendance(e.target.value)} className="border border-gray-300 bg-gray-50 rounded-xl p-3" required />
        </div>
        
        <RequirePermission permissions={[PERMISSIONS.exams.manage]}>
          <button type="submit" disabled={generateMutation.isPending} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50">
            {generateMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            Generate AI Comment
          </button>
        </RequirePermission>
      </form>

      {comment && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 shadow-inner animate-fade-in space-y-4">
          <h2 className="font-black text-green-800 mb-2 flex items-center gap-2"><CheckCircle2 size={20} /> Generated Comment</h2>
          <textarea rows={4} value={comment} onChange={e => setComment(e.target.value)} className="w-full bg-white p-4 border border-green-200 rounded-xl text-green-900 font-medium outline-none" />
          <button onClick={saveComment} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition">
            <Save size={18} /> Save to Student Profile
          </button>
        </div>
      )}
    </div>
  );
}
