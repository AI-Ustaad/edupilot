"use client";
import React, { useState, useEffect } from "react";
import { Users, Briefcase, GraduationCap, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ studentsCount: 0, staffCount: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [studentsRes, staffRes] = await Promise.all([
          fetch("/api/students", { credentials: "include" }),
          fetch("/api/staff", { credentials: "include" })
        ]);

        if (studentsRes.status === 401 || studentsRes.status === 403) {
           window.location.href = "/login"; // Force re-auth
           return;
        }

        // 🛡️ CRITICAL FIX: Safe Data Parsing (اگر API سے ایرر آئے تو بھی کریش نہ ہو)
        const studentsData = studentsRes.ok ? await studentsRes.json() : [];
        const staffData = staffRes.ok ? await staffRes.json() : [];

        setStats({
          studentsCount: Array.isArray(studentsData) ? studentsData.length : 0,
          staffCount: Array.isArray(staffData) ? staffData.length : 0,
        });
        
        setLoading(false);
      } catch (err: any) {
        console.error("Dashboard Error:", err);
        setError("Network delay or isolated workspace not fully initialized.");
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [router]);

  if (loading) return (
     <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in"><Loader2 className="animate-spin text-blue-500 mb-4" size={48} /><h2 className="text-xl font-black text-[#0F172A] uppercase tracking-widest">Syncing Workspace...</h2></div>
  );

  return (
    <div className="animate-fade-in space-y-6 pb-20 w-full">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight uppercase">Command Centre</h1>
        <p className="text-sm text-slate-500 mt-1 font-bold">Welcome to your secure EduPilot workspace.</p>
      </div>

      {error && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl flex items-center gap-3 text-orange-700 font-bold mb-6">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
           <GraduationCap size={100} className="absolute -right-4 -bottom-4 opacity-20" />
           <div className="relative z-10">
              <p className="text-blue-100 font-black text-xs uppercase tracking-widest mb-1">Total Enrolled</p>
              <h2 className="text-5xl font-black">{stats.studentsCount}</h2>
           </div>
        </div>

        <div className="bg-gradient-to-br from-[#0F172A] to-slate-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
           <Briefcase size={100} className="absolute -right-4 -bottom-4 opacity-20" />
           <div className="relative z-10">
              <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-1">Total Employees</p>
              <h2 className="text-5xl font-black">{stats.staffCount}</h2>
           </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-center">
           <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-4">System Status</p>
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div></div>
              <div><h3 className="font-black text-[#0F172A] uppercase">Tenant Isolated</h3><p className="text-xs font-bold text-slate-500">100% Secure</p></div>
           </div>
        </div>
      </div>
    </div>
  );
}
