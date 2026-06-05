"use client";

import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useBranding } from "@/context/BrandingContext";
import { useQuery } from "@tanstack/react-query";
import {
  Users, Briefcase, DollarSign, Activity, AlertTriangle, Loader2
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

// انیمیشن کے ویریئنٹس
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const branding = useBranding();
  const primaryColor = branding?.primaryColor || "#3b82f6";

  // 1. Bulletproof React Query Fetching (Defensive Parsing)
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboardData", user?.tenantId],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      
      // اگر API 500 یا کوئی اور ایرر دے تو یہیں پکڑ لیں
      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }
      
      const text = await res.text();
      if (!text) return null; // خالی رسپانس کا علاج
      
      try {
        const json = JSON.parse(text);
        return json.data || json; // اگر ڈیٹا 'data' key میں ہے تو نکال لیں
      } catch (err) {
        throw new Error("Invalid JSON from API");
      }
    },
    enabled: !!user?.tenantId && !authLoading,
  });

  // لوڈنگ سٹیٹ (UI)
  if (isLoading || authLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
        <p className="text-slate-500 font-bold tracking-widest uppercase text-sm">Loading Dashboard...</p>
      </div>
    );
  }

  // ایرر سٹیٹ (White Screen Crash سے بچاؤ)
  if (isError) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center gap-3">
        <AlertTriangle className="text-red-500 w-16 h-16" />
        <h2 className="text-2xl font-black text-slate-800">Dashboard Unavailable</h2>
        <p className="text-slate-500">Failed to load data. API might be returning an error.</p>
        <p className="text-xs text-red-400 font-mono mt-2 bg-red-50 p-2 rounded">{error?.message}</p>
      </div>
    );
  }

  // محفوظ ڈیٹا (Safe Fallbacks اگر API سے کچھ ڈیٹا مسنگ ہو)
  const stats = data?.stats || {
    students: data?.totalStudents || 0,
    teachers: data?.totalTeachers || 0,
    revenue: data?.totalRevenue || 0,
    attendance: data?.averageAttendance || 0
  };

  const chartData = data?.chartData || data?.revenueTrend || [
    { name: "Jan", value: 0 }, { name: "Feb", value: 0 }
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="p-4 md:p-8 max-w-7xl mx-auto space-y-8"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 font-medium mt-1">Welcome back, {user?.email}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Students</p>
            <p className="text-2xl font-black text-slate-800">{stats.students}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl"><Briefcase size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Staff</p>
            <p className="text-2xl font-black text-slate-800">{stats.teachers}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Revenue</p>
            <p className="text-2xl font-black text-slate-800">Rs {stats.revenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl"><Activity size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Attendance</p>
            <p className="text-2xl font-black text-slate-800">{stats.attendance}%</p>
          </div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
          <Activity className="text-blue-500" /> Activity Overview
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={primaryColor} 
                strokeWidth={4} 
                dot={{ r: 4, fill: primaryColor, strokeWidth: 2, stroke: "#fff" }} 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </motion.div>
  );
}
