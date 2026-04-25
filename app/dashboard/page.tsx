"use client";
import React, { useState, useEffect } from "react";
import { Users, Briefcase, GraduationCap, Clock, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [stats, setStats] = useState({
    studentsCount: 0,
    staffCount: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 👉 API کے ذریعے صرف اپنے اسکول (Tenant) کا ڈیٹا منگوائیں
        const [studentsRes, staffRes] = await Promise.all([
          fetch("/api/students", { credentials: "include" }),
          fetch("/api/staff", { credentials: "include" })
        ]);

        // اگر سیشن ایکسپائر ہو گیا ہے یا یوزر ڈیلیٹ ہو گیا ہے
        if (studentsRes.status === 401 || studentsRes.status === 403) {
           router.replace("/login");
           return;
        }

        const studentsData = await studentsRes.json();
        const staffData = await staffRes.json();

        setStats({
          studentsCount: studentsData.length || 0,
          staffCount: staffData.length || 0,
        });
        
        setLoading(false);
      } catch (err: any) {
        console.error("Dashboard Error:", err);
        setError("Failed to load workspace data. Please check your connection.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  // 🌀 محفوظ لوڈنگ سکرین
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
        <h2 className="text-xl font-black text-[#0F172A] uppercase tracking-widest">Securing Workspace...</h2>
        <p className="text-slate-400 font-bold text-sm mt-2">Loading your isolated tenant data</p>
      </div>
    );
  }

  // ❌ ایرر سکرین (تاکہ ڈیش بورڈ اندھا دھند نہ گھومے)
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-3xl flex flex-col items-center justify-center min-h-[40vh] text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-black text-red-700 uppercase">Workspace Error</h2>
        <p className="text-red-600 font-bold mt-2">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-6 bg-red-600 text-white px-6 py-2 rounded-xl font-bold uppercase">Retry</button>
      </div>
    );
  }

  // ✅ اصل ڈیش بورڈ
  return (
    <div className="animate-fade-in space-y-6 pb-20 w-full">
      
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight uppercase">Command Centre</h1>
        <p className="text-sm text-slate-500 mt-1 font-bold">Welcome to your secure EduPilot workspace.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Students Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
           <GraduationCap size={100} className="absolute -right-4 -bottom-4 opacity-20" />
           <div className="relative z-10">
              <p className="text-blue-100 font-black text-xs uppercase tracking-widest mb-1">Total Enrolled</p>
              <h2 className="text-5xl font-black">{stats.studentsCount}</h2>
              <p className="text-sm font-bold mt-4 flex items-center gap-2"><Users size={16}/> Active Students</p>
           </div>
        </div>

        {/* Staff Card */}
        <div className="bg-gradient-to-br from-[#0F172A] to-slate-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
           <Briefcase size={100} className="absolute -right-4 -bottom-4 opacity-20" />
           <div className="relative z-10">
              <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-1">Total Employees</p>
              <h2 className="text-5xl font-black">{stats.staffCount}</h2>
              <p className="text-sm font-bold mt-4 flex items-center gap-2"><Users size={16}/> Active Staff</p>
           </div>
        </div>

        {/* Quick Status Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-center">
           <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-4">System Status</p>
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                 <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                 <h3 className="font-black text-[#0F172A] uppercase">Tenant Isolated</h3>
                 <p className="text-xs font-bold text-slate-500">100% Secure & Active</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
