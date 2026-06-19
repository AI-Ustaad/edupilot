"use client";

import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  Users, Briefcase, DollarSign, Activity, CalendarDays,
  CreditCard, Clock, AlertTriangle, TrendingUp, Loader2,
  GraduationCap
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { useQuery } from "@tanstack/react-query";

const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };
const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

// 🚀 FIX: نئی v1 API اور Credentials کے ساتھ
const fetchDashboardData = async () => {
  const res = await fetch("/api/v1/dashboard", { credentials: "include", cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch dashboard data");
  const json = await res.json();
  return json.data || json;
};

const fetchRiskStudents = async () => {
  const res = await fetch("/api/v1/students/risk", { credentials: "include", cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch risk students");
  const json = await res.json();
  return json.data || [];
};

export default function DashboardPage() {
  const { user } = useAuth();

  const { data, isLoading: isDashLoading, error: dashError } = useQuery({
    queryKey: ["dashboard", user?.tenantId],
    queryFn: fetchDashboardData,
    enabled: !!user?.tenantId,
  });

  const { data: riskStudents = [] } = useQuery({
    queryKey: ["riskStudents", user?.tenantId],
    queryFn: fetchRiskStudents,
    enabled: !!user?.tenantId,
  });

  if (isDashLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (dashError || !data) {
    return (
      <div className="p-8 text-center text-red-500">
        <AlertTriangle className="mx-auto mb-2" size={32} />
        <p className="font-bold">Failed to load dashboard data.</p>
      </div>
    );
  }

  const attendancePercent = data.todayAttendance.present + data.todayAttendance.absent > 0
    ? ((data.todayAttendance.present / (data.todayAttendance.present + data.todayAttendance.absent)) * 100).toFixed(0)
    : "0";

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-8">
      {/* 🚀 آپ کا پرانا اور Awesome Header اور Cards */}
      <motion.div variants={fadeInUp} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Command Center</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm">
          <CalendarDays size={16} />
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </motion.div>

      <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Students" value={data.students.toLocaleString()} icon={<Users size={24} className="text-blue-600" />} color="blue" />
        <KpiCard title="Total Staff" value={data.staff.toLocaleString()} icon={<Briefcase size={24} className="text-purple-600" />} color="purple" />
        <KpiCard title="Revenue (Month)" value={`Rs ${data.revenue.toLocaleString()}`} icon={<DollarSign size={24} className="text-green-600" />} color="green" />
        <KpiCard title="Today's Attendance" value={`${attendancePercent}%`} subtitle={`${data.todayAttendance.present}P / ${data.todayAttendance.absent}A`} icon={<Activity size={24} className="text-cyan-600" />} color="cyan" />
      </motion.div>

      {/* AI Risk Engine Data */}
      {riskStudents.length > 0 && (
        <motion.div variants={fadeInUp} className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-600" /> Students At Risk ({riskStudents.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {riskStudents.slice(0, 6).map((student: any) => (
              <div key={student.id} className="bg-white border border-red-100 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900">{student.fullName || student.name}</p>
                    <p className="text-xs text-gray-500">{student.classGrade} {student.section}</p>
                  </div>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-bold">
                    {student.riskReason || "At Risk"}
                  </span>
                </div>
                <div className="flex gap-4 mt-3 text-xs">
                  <div><p className="text-gray-400">Attendance</p><p className="font-bold text-red-600">{student.attendance}%</p></div>
                  <div><p className="text-gray-400">Marks</p><p className="font-bold text-orange-600">{student.marks}%</p></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 🚀 آپ کے پرانے Attendance & Fee Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={fadeInUp} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-gray-900">
            <TrendingUp size={20} className="text-blue-600" /> Weekly Attendance Trend
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.attendanceTrend}>
              <defs>
                <linearGradient id="colorPercent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={12} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px" }} />
              <Area type="monotone" dataKey="percent" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPercent)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={fadeInUp} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
            <CreditCard size={20} className="text-green-600" /> Fee Collection (Current Month)
          </h3>
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 font-medium">Collected: <span className="font-bold text-green-600">Rs {data.feeMonth.collected.toLocaleString()}</span></span>
              <span className="text-gray-500">Pending: <span className="font-bold text-orange-500">Rs {data.feeMonth.pending.toLocaleString()}</span></span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full" style={{ width: `${(data.feeMonth.collected / (data.feeMonth.total || 1)) * 100}%` }} />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function KpiCard({ title, value, icon, subtitle, color }: any) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600", purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600", cyan: "bg-cyan-50 text-cyan-600",
  };
  return (
    <motion.div variants={fadeInUp} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-black mt-2 text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1 font-medium">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl ${colorClasses[color] || colorClasses.blue}`}>{icon}</div>
        </div>
      </div>
    </motion.div>
  );
}
