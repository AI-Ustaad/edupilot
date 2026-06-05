"use client";

import React from "react";
import { useParams } from "next/navigation";
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
  const params = useParams();
  const studentId = params.id as string; // 🚀 Using Dynamic Route [id] instead of searchParams

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
    enabled: !!studentId,
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
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
        <p className="text-slate-500 font-bold tracking-widest uppercase text-sm">Compiling 360° Intelligence...</p>
      </div>
    );
  }

  if (isError || !dashboardData) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center gap-3">
        <AlertTriangle className="text-red-500 w-16 h-16" />
        <h2 className="text-2xl font-black text-slate-800">Student Profile Not Found</h2>
        <p className="text-slate-500">The 360° view could not be loaded for ID: {studentId}</p>
      </div>
    );
  }

  const { student, attendanceTrend, marksTrend, recentQuizzes, recentAssignments, aiSuggestions } = dashboardData;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">{student?.fullName || student?.name || "Student Profile"}</h1>
          <p className="text-slate-500 font-medium mt-1">Comprehensive Performance 360° View</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border shadow-sm">
           <div className="text-right">
             <p className="text-xs font-bold text-slate-400 uppercase">Health Score</p>
             <p className="text-xl font-black text-emerald-600">92/100</p>
           </div>
        </div>
      </div>
      
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Class</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{student?.classGrade || "N/A"} <span className="text-blue-600">{student?.section || ""}</span></p>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Latest Attendance</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {attendanceTrend?.length > 0 ? `${attendanceTrend[attendanceTrend.length - 1].percentage}%` : "N/A"}
          </p>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Latest Marks</p>
          <p className="text-2xl font-black text-purple-600 mt-1">
            {marksTrend?.length > 0 ? `${marksTrend[marksTrend.length - 1].percentage}%` : "N/A"}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><TrendingUp className="text-blue-600" /> Attendance Trend</h2>
          {attendanceTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={attendanceTrend}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="percentage" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-400 font-medium py-10 text-center bg-slate-50 rounded-xl">No attendance data available.</p>}
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><BookOpen className="text-emerald-600" /> Academic Trend</h2>
          {marksTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={marksTrend}>
                <XAxis dataKey="term" stroke="#94a3b8" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="percentage" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-400 font-medium py-10 text-center bg-slate-50 rounded-xl">No examination data available.</p>}
        </div>
      </div>

      {/* Quizzes & Assignments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-black text-slate-900 mb-4 border-b border-slate-100 pb-3">Recent Quizzes</h2>
          {!recentQuizzes || recentQuizzes.length === 0 ? <p className="text-slate-400 text-sm">No quizzes taken.</p> : 
            <ul className="space-y-3">
              {recentQuizzes.map((q: any, idx: number) => (
                <li key={q.id || idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700">{q.quizTitle || "Quiz"}</span>
                  <span className="font-black text-blue-600 bg-blue-100 px-3 py-1 rounded-lg">{q.percentage}%</span>
                </li>
              ))}
            </ul>
          }
        </div>
        
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-black text-slate-900 mb-4 border-b border-slate-100 pb-3">Recent Assignments</h2>
          {!recentAssignments || recentAssignments.length === 0 ? <p className="text-slate-400 text-sm">No assignments submitted.</p> : 
            <ul className="space-y-3">
              {recentAssignments.map((a: any, idx: number) => (
                <li key={a.id || idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700">{a.fileName || "File"}</span>
                  <span className="text-xs font-bold text-slate-500">{a.createdAt ? new Date(a.createdAt?.toDate?.() || a.createdAt).toLocaleDateString() : 'N/A'}</span>
                </li>
              ))}
            </ul>
          }
        </div>
      </div>

      {/* Behavior Logs */}
      {behaviorLogs?.length > 0 && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-black text-slate-900 mb-4 border-b border-slate-100 pb-3">Behavior Log</h2>
          <div className="space-y-3">
            {behaviorLogs.map((log: any, idx: number) => (
              <div key={log.id || idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-sm font-bold text-slate-800">{log.reason}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase ml-3 bg-white px-2 py-1 rounded-md border">
                    {log.createdAt ? new Date(log.createdAt?.toDate?.() || log.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <span className={`font-black px-3 py-1 rounded-lg ${log.points > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                  {log.points > 0 ? "+" : ""}{log.points} Pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights Widget */}
      {aiSuggestions && (
        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 shadow-sm rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-violet-200 px-4 py-1 rounded-bl-xl text-[10px] font-black text-violet-700 uppercase tracking-widest flex items-center gap-1 shadow-sm">
            <Sparkles size={12}/> EduPilot AI
          </div>
          <h2 className="text-lg font-black text-violet-900 mb-3 flex items-center gap-2">
            <CheckCircle className="text-violet-600" /> AI-Powered Improvement Insights
          </h2>
          <p className="text-violet-800/90 whitespace-pre-line font-medium leading-relaxed">{aiSuggestions}</p>
        </div>
      )}

    </div>
  );
}
