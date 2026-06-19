"use client";

import React from "react";
import { motion } from "framer-motion";
// 🟢 KEEP: 2026 Auth Context
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
// 🟢 KEEP: TanStack Query
import { useQuery } from "@tanstack/react-query";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

interface DashboardData {
  students: number;
  staff: number;
  revenue: number;
  todayAttendance: { present: number; absent: number };
  attendanceTrend: { day: string; percent: number }[];
  attendanceStats: { avg: number; highest: number; lowest: number };
  feeMonth: { collected: number; pending: number; total: number };
  classFeeSummary: { class: string; collected: number; total: number }[];
  recentPayments: { id: string; studentName: string; amount: number; date: string }[];
  classDistribution: { name: string; value: number }[];
}

// 🟢 KEEP: Fetching from SaaS 2026 v1 API with credentials
const fetchDashboardData = async () => {
  const res = await fetch("/api/v1/dashboard", {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard data");
  const json = await res.json();
  return json.data || json;
};

// 🟢 KEEP: Fetching from SaaS 2026 v1 Risk API
const fetchRiskStudents = async () => {
  const res = await fetch("/api/v1/students/risk", {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch risk students");
  const json = await res.json();
  return json.data || [];
};

export default function DashboardPage() {
  const { user } = useAuth();

  // 🟢 KEEP: Multi-tenant enabled queries
  const { data, isLoading: isDashLoading, error: dashError } = useQuery<DashboardData>({
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
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-gray-600 font-medium">Aggregating Command Center...</p>
        </div>
      </div>
    );
  }

  if (dashError || !data) {
    return (
      <div className="p-8 text-center text-red-500">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
          <AlertTriangle className="mx-auto mb-4 text-red-600" size={48} />
          <h3 className="text-xl font-bold text-red-800 mb-2">Dashboard Analytics Failed</h3>
          <p className="text-red-600 mb-4">Secure connection to tenant database could not be established.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-bold transition"
          >
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  const attendancePercent =
    data.todayAttendance.present + data.todayAttendance.absent > 0
      ? ((data.todayAttendance.present / (data.todayAttendance.present + data.todayAttendance.absent)) * 100).toFixed(0)
      : "0";

  return (
    // 🔴 REPLACE: Restoring the Original Beautiful UI
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-8">
      
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900">Command Center</h1>
          <p className="text-gray-500 mt-2 text-lg">Welcome back! Here&apos;s what&apos;s happening across your institution today.</p>
        </div>
        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-5 py-3 rounded-xl font-bold text-sm border border-blue-100 shadow-sm">
          <CalendarDays size={18} />
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Students" value={data.students.toLocaleString()} icon={<Users size={24} className="text-blue-600" />} color="blue" />
        <KpiCard title="Total Staff" value={data.staff.toLocaleString()} icon={<Briefcase size={24} className="text-purple-600" />} color="purple" />
        <KpiCard title="Revenue (Month)" value={`Rs ${data.revenue.toLocaleString()}`} icon={<DollarSign size={24} className="text-green-600" />} color="green" />
        <KpiCard title="Today's Attendance" value={`${attendancePercent}%`} subtitle={`${data.todayAttendance.present} Present / ${data.todayAttendance.absent} Absent`} icon={<Activity size={24} className="text-cyan-600" />} color="cyan" />
      </motion.div>

      {/* AI Risk Engine Module */}
      {riskStudents.length > 0 && (
        <motion.div variants={fadeInUp} className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 border border-red-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-red-800 flex items-center gap-3">
              <AlertTriangle className="text-red-600" size={24} />
              AI Alert: Students At Risk ({riskStudents.length})
            </h2>
            <button 
              onClick={() => window.location.href = "/ai/risk"}
              className="text-sm bg-white text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-50 transition border border-red-200"
            >
              View Analysis
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {riskStudents.slice(0, 6).map((student: any) => (
              <div key={student.id} className="bg-white border border-red-100 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{student.fullName || student.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{student.classGrade} {student.section && `- ${student.section}`}</p>
                  </div>
                  <span className="text-xs bg-gradient-to-r from-red-100 to-orange-100 text-red-800 px-3 py-1 rounded-full font-bold border border-red-200">
                    {student.riskReason || "High Risk"}
                  </span>
                </div>
                <div className="flex gap-6 mt-4 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs font-medium mb-1">Attendance</p>
                    <p className="font-black text-red-600 text-lg">{student.attendance}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-medium mb-1">Marks</p>
                    <p className="font-black text-orange-600 text-lg">{student.marks}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Analytics Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={fadeInUp} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold flex items-center gap-3 mb-6 text-gray-900">
            <TrendingUp size={24} className="text-blue-600" /> 
            Weekly Attendance Trend
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.attendanceTrend}>
              <defs>
                <linearGradient id="colorPercent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                labelStyle={{ fontWeight: "bold", color: "#111827" }}
              />
              <Area type="monotone" dataKey="percent" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPercent)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={fadeInUp} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900">
            <CreditCard size={24} className="text-green-600" /> 
            Fee Collection Overview
          </h3>
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-gray-600 font-medium">Collected: <span className="font-bold text-green-600 text-lg">Rs {data.feeMonth.collected.toLocaleString()}</span></span>
              <span className="text-gray-500">Pending: <span className="font-bold text-orange-500 text-lg">Rs {data.feeMonth.pending.toLocaleString()}</span></span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(data.feeMonth.collected / (data.feeMonth.total || 1)) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full"
              />
            </div>
          </div>
          <h4 className="font-bold mb-4 text-gray-800 text-sm">Class-wise Collection</h4>
          <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
            {data.classFeeSummary.map((c: any) => (
              <div key={c.class}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-700 font-medium">{c.class}</span>
                  <span className="text-gray-500">Rs {c.collected.toLocaleString()} / {c.total.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full"
                    style={{ width: `${(c.collected / (c.total || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Analytics Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={fadeInUp} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900">
            <Users size={24} className="text-purple-600" /> 
            Student Demographics
          </h3>
          {data.classDistribution.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl">
              <GraduationCap size={48} className="mb-3 opacity-50" />
              <p>No demographic data available</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-8">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie 
                    data={data.classDistribution} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" cy="50%" 
                    outerRadius={90} innerRadius={50} paddingAngle={2}
                  >
                    {data.classDistribution.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 w-full">
                {data.classDistribution.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                      <span className="text-sm text-gray-700 font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{item.value} students</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div variants={fadeInUp} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900">
            <Clock size={24} className="text-orange-500" /> 
            Recent Transactions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="pb-3 text-left font-bold">Student</th>
                  <th className="pb-3 text-left font-bold">Month</th>
                  <th className="pb-3 text-right font-bold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.recentPayments.slice(0, 8).map((p: any) => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                    <td className="py-3.5 text-gray-900 font-medium">{p.studentName}</td>
                    <td className="py-3.5 text-gray-600">{p.date}</td>
                    <td className="py-3.5 text-green-600 font-bold text-right">Rs {p.amount.toLocaleString()}</td>
                  </tr>
                ))}
                {data.recentPayments.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-400">
                      <CreditCard size={32} className="mx-auto mb-2 opacity-50" />
                      No recent payments
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// KPI Component
function KpiCard({ title, value, icon, subtitle, color }: any) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    cyan: "bg-cyan-50 text-cyan-600",
  };

  return (
    <motion.div 
      variants={fadeInUp}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-black mt-3 text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-2 font-medium">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color] || colorClasses.blue} shadow-sm`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
