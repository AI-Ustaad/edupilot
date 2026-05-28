"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, TrendingUp, BookOpen, CheckCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Student360Data {
  student: any;
  attendanceTrend: { month: string; percentage: number }[];
  marksTrend: { term: string; percentage: number }[];
  recentQuizzes: any[];
  recentAssignments: any[];
  aiSuggestions: string;
}

export default function Student360Page() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("id");
  const [data, setData] = useState<Student360Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [behaviorLogs, setBehaviorLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!studentId) return;
    fetch(`/api/students/360?id=${studentId}`)
      .then(res => res.json())
      .then(json => {
        if (json.success) setData(json.data);
        else console.error("Failed to load 360 view");
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // بیہیویئر لاگ لوڈ کریں
    fetch(`/api/behavior?studentId=${studentId}`)
      .then(res => res.json())
      .then(json => {
        if (json.success) setBehaviorLogs(json.data);
      });
  }, [studentId]);

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" size={32} /></div>;
  if (!data) return <div className="p-8 text-center text-gray-500">Student not found.</div>;

  const { student, attendanceTrend, marksTrend, recentQuizzes, recentAssignments, aiSuggestions } = data;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">{student.fullName || student.name} – Performance 360°</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-sm text-gray-500">Current Class</p><p className="text-xl font-bold text-gray-900">{student.classGrade} {student.section || ""}</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-sm text-gray-500">Latest Attendance</p><p className="text-xl font-bold text-gray-900">{attendanceTrend.length > 0 ? `${attendanceTrend[attendanceTrend.length - 1].percentage}%` : "N/A"}</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-sm text-gray-500">Latest Marks</p><p className="text-xl font-bold text-gray-900">{marksTrend.length > 0 ? `${marksTrend[marksTrend.length - 1].percentage}%` : "N/A"}</p></div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="text-blue-600" /> Attendance Trend (6 months)</h2>
        {attendanceTrend.length > 0 ? (<ResponsiveContainer width="100%" height={250}><LineChart data={attendanceTrend}><XAxis dataKey="month" stroke="#9ca3af" /><YAxis domain={[0, 100]} stroke="#9ca3af" /><Tooltip /><Line type="monotone" dataKey="percentage" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} /></LineChart></ResponsiveContainer>) : <p className="text-gray-500">No attendance data available.</p>}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><BookOpen className="text-green-600" /> Marks Trend (by Term)</h2>
        {marksTrend.length > 0 ? (<ResponsiveContainer width="100%" height={250}><LineChart data={marksTrend}><XAxis dataKey="term" stroke="#9ca3af" /><YAxis domain={[0, 100]} stroke="#9ca3af" /><Tooltip /><Line type="monotone" dataKey="percentage" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} /></LineChart></ResponsiveContainer>) : <p className="text-gray-500">No marks data available.</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6"><h2 className="text-lg font-bold text-gray-900 mb-4">Recent Quizzes</h2>{recentQuizzes.length === 0 ? <p className="text-gray-500">No quizzes taken.</p> : <ul className="space-y-2">{recentQuizzes.map((q: any) => (<li key={q.id} className="flex justify-between border-b pb-2"><span className="text-gray-700">{q.quizTitle || "Quiz"}</span><span className="font-bold text-gray-900">{q.percentage}%</span></li>))}</ul>}</div>
        <div className="bg-white border border-gray-200 rounded-xl p-6"><h2 className="text-lg font-bold text-gray-900 mb-4">Recent Assignments</h2>{recentAssignments.length === 0 ? <p className="text-gray-500">No assignments submitted.</p> : <ul className="space-y-2">{recentAssignments.map((a: any) => (<li key={a.id} className="flex justify-between border-b pb-2"><span className="text-gray-700">{a.fileName || "File"}</span><span className="text-sm text-gray-500">{new Date(a.createdAt?.toDate?.()).toLocaleDateString()}</span></li>))}</ul>}</div>
      </div>

      {/* 🆕 Behavior Log */}
      {behaviorLogs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Behavior Log</h2>
          <div className="space-y-2">
            {behaviorLogs.map((log: any) => (
              <div key={log.id} className="flex justify-between items-center">
                <div><span className="text-sm font-medium text-gray-700">{log.reason}</span><span className="text-xs text-gray-500 ml-2">{new Date(log.createdAt?.toDate?.()).toLocaleDateString()}</span></div>
                <span className={`font-bold ${log.points > 0 ? "text-green-600" : "text-red-600"}`}>{log.points > 0 ? "+" : ""}{log.points}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {aiSuggestions && (<div className="bg-purple-50 border border-purple-200 rounded-xl p-6"><h2 className="text-lg font-bold text-purple-800 mb-2 flex items-center gap-2"><CheckCircle className="text-purple-600" /> AI-Powered Improvement Tips</h2><p className="text-gray-800 whitespace-pre-line">{aiSuggestions}</p></div>)}
    </div>
  );
}
