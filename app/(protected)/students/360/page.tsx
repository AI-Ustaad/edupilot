"use client";
export const dynamic = 'force-dynamic';

import { useSearchParams } from "next/navigation";
import { Loader2, TrendingUp, BookOpen, CheckCircle, AlertTriangle, Sparkles } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";

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

  // React Query for 360 Data
  const { data: dashboardData, isLoading: loading360, isError } = useQuery<Student360Data>({
    queryKey: ["student360", studentId],
    queryFn: async () => {
      const res = await fetch(`/api/students/360?id=${studentId}`);
      if (!res.ok) throw new Error("Failed to fetch 360 view");
      const json = await res.json();
      if (!json.success) throw new Error("No data found");
      return json.data;
    },
    enabled: !!studentId, // ID موجود ہونے پر ہی فیچ کرے گا
  });

  // React Query for Behavior Logs
  const { data: behaviorLogs = [], isLoading: loadingBehavior } = useQuery<any[]>({
    queryKey: ["behaviorLogs", studentId],
    queryFn: async () => {
      const res = await fetch(`/api/behavior?studentId=${studentId}`);
      if (!res.ok) throw new Error("Failed to fetch behavior");
      const json = await res.json();
      return json.success ? json.data : [];
    },
    enabled: !!studentId,
  });

  const isLoading = loading360 || loadingBehavior;

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
        <p className="text-gray-500 font-bold">Compiling 360° Profile...</p>
      </div>
    );
  }

  if (isError || !dashboardData) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center gap-2">
        <AlertTriangle className="text-red-500 w-12 h-12" />
        <h2 className="text-xl font-bold text-gray-800">Student Not Found</h2>
        <p className="text-gray-500">The 360° view could not be loaded.</p>
      </div>
    );
  }

  const { student, attendanceTrend, marksTrend, recentQuizzes, recentAssignments, aiSuggestions } = dashboardData;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in-up">
      <h1 className="text-3xl font-black text-gray-900">{student.fullName || student.name} – Performance 360°</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Class</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{student.classGrade} <span className="text-blue-600">{student.section || ""}</span></p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Latest Attendance</p>
          <p className="text-2xl font-black text-green-600 mt-1">
            {attendanceTrend.length > 0 ? `${attendanceTrend[attendanceTrend.length - 1].percentage}%` : "N/A"}
          </p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Latest Marks</p>
          <p className="text-2xl font-black text-purple-600 mt-1">
            {marksTrend.length > 0 ? `${marksTrend[marksTrend.length - 1].percentage}%` : "N/A"}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
        <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2"><TrendingUp className="text-blue-600" /> Attendance Trend (6 months)</h2>
        {attendanceTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={attendanceTrend}>
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickMargin={10} />
              <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={12} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Line type="monotone" dataKey="percentage" stroke="#3b82f6" strokeWidth={4} dot={{ r: 5, fill: "#3b82f6" }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <p className="text-gray-400 font-medium py-10 text-center bg-gray-50 rounded-xl">No attendance data available yet.</p>}
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
        <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2"><BookOpen className="text-green-600" /> Marks Trend (by Term)</h2>
        {marksTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={marksTrend}>
              <XAxis dataKey="term" stroke="#9ca3af" fontSize={12} tickMargin={10} />
              <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={12} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Line type="monotone" dataKey="percentage" stroke="#10b981" strokeWidth={4} dot={{ r: 5, fill: "#10b981" }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <p className="text-gray-400 font-medium py-10 text-center bg-gray-50 rounded-xl">No examination data available yet.</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-black text-gray-900 mb-4 border-b border-gray-100 pb-3">Recent Quizzes</h2>
          {recentQuizzes.length === 0 ? <p className="text-gray-400 text-sm">No quizzes taken.</p> : 
            <ul className="space-y-3">
              {recentQuizzes.map((q: any) => (
                <li key={q.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="font-bold text-gray-700">{q.quizTitle || "Quiz"}</span>
                  <span className="font-black text-blue-600 bg-blue-100 px-3 py-1 rounded-lg">{q.percentage}%</span>
                </li>
              ))}
            </ul>
          }
        </div>
        
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-black text-gray-900 mb-4 border-b border-gray-100 pb-3">Recent Assignments</h2>
          {recentAssignments.length === 0 ? <p className="text-gray-400 text-sm">No assignments submitted.</p> : 
            <ul className="space-y-3">
              {recentAssignments.map((a: any) => (
                <li key={a.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="font-bold text-gray-700">{a.fileName || "File"}</span>
                  <span className="text-xs font-bold text-gray-500">{new Date(a.createdAt?.toDate?.()).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          }
        </div>
      </div>

      {behaviorLogs.length > 0 && (
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-black text-gray-900 mb-4 border-b border-gray-100 pb-3">Behavior Log</h2>
          <div className="space-y-3">
            {behaviorLogs.map((log: any) => (
              <div key={log.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <span className="text-sm font-bold text-gray-800">{log.reason}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase ml-3 bg-white px-2 py-1 rounded-md border">
                    {new Date(log.createdAt?.toDate?.()).toLocaleDateString()}
                  </span>
                </div>
                <span className={`font-black px-3 py-1 rounded-lg ${log.points > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {log.points > 0 ? "+" : ""}{log.points} Pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {aiSuggestions && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 shadow-sm rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-purple-200 px-4 py-1 rounded-bl-xl text-[10px] font-black text-purple-700 uppercase tracking-widest flex items-center gap-1">
            <Sparkles size={12}/> EduPilot AI
          </div>
          <h2 className="text-lg font-black text-purple-900 mb-3 flex items-center gap-2">
            <CheckCircle className="text-purple-600" /> AI-Powered Improvement Tips
          </h2>
          <p className="text-purple-800/90 whitespace-pre-line font-medium leading-relaxed">{aiSuggestions}</p>
        </div>
      )}
    </div>
  );
}
