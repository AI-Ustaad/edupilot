"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  Users, Briefcase, DollarSign, Activity, CalendarDays,
  CreditCard, Clock, AlertTriangle, TrendingUp, Loader2,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

// 🚀 Layered Architecture Hooks
import { useDashboardMetrics, useRiskStudents } from "@/hooks/useDashboard";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const CHART_COLORS = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899"];

export default function DashboardPage() {
  // 1. Fetch Live Dashboard Data
  const { data, isLoading, error } = useDashboardMetrics();
  
  // 2. Fetch Live Risk Students
  const { data: riskStudents = [] } = useRiskStudents();

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-red-500">
        <AlertTriangle className="mx-auto mb-2" size={32} />
        <p className="font-bold">Dashboard data لوڈ نہیں ہوا۔ براہ کرم دوبارہ لاگ ان کریں۔</p>
      </div>
    );
  }

  // Safe Data Extraction
  const total = (data.todayAttendance?.present || 0) + (data.todayAttendance?.absent || 0);
  const attendancePercent = total > 0 ? ((data.todayAttendance.present / total) * 100).toFixed(0) : "0";
  
  const attendanceTrend = data.attendanceTrend || [];
  const attendanceStats = data.attendanceStats || { avg: 0, highest: 0, lowest: 0 };
  const feeMonth = data.feeMonth || { collected: 0, pending: 0, total: 0 };
  const classFeeSummary = data.classFeeSummary || [];
  const recentPayments = data.recentPayments || [];
  const classDistribution = data.classDistribution || [];

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-8">
      <motion.div variants={fadeInUp} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Command Center</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here is what is happening today.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm">
          <CalendarDays size={16} />
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </motion.div>

      <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Students" value={data.students || 0} icon={<Users size={24} className="text-blue-600" />} color="blue" />
        <KpiCard title="Total Staff" value={data.staff || 0} icon={<Briefcase size={24} className="text-purple-600" />} color="purple" />
        <KpiCard title="Revenue (Month)" value={"Rs " + (data.revenue || 0).toLocaleString()} icon={<DollarSign size={24} className="text-green-600" />} color="green" />
        <KpiCard title="Today Attendance" value={attendancePercent + "%"} subtitle={(data.todayAttendance?.present || 0) + "P / " + (data.todayAttendance?.absent || 0) + "A"} icon={<Activity size={24} className="text-cyan-600" />} color="cyan" />
      </motion.div>

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
                  <div><p className="text-gray-400">Attendance</p><p className="font-bold text-red-600">{student.attendance || 0}%</p></div>
                  <div><p className="text-gray-400">Marks</p><p className="font-bold text-orange-600">{student.marks || 0}%</p></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={fadeInUp} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-gray-900">
            <TrendingUp size={20} className="text-blue-600" /> Weekly Attendance Trend
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={attendanceTrend}>
              <defs>
                <linearGradient id="colorPercent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={12} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px" }} />
              <Area type="monotone" dataKey="percent" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPercent)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div><p className="text-gray-500 text-xs">Average</p><p className="text-xl font-black text-gray-900">{attendanceStats.avg}%</p></div>
            <div><p className="text-gray-500 text-xs">Highest</p><p className="text-xl font-black text-green-600">{attendanceStats.highest}%</p></div>
            <div><p className="text-gray-500 text-xs">Lowest</p><p className="text-xl font-black text-red-500">{attendanceStats.lowest}%</p></div>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
            <CreditCard size={20} className="text-green-600" /> Fee Collection (Current Month)
          </h3>
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 font-medium">Collected: <span className="font-bold text-green-600">Rs {feeMonth.collected.toLocaleString()}</span></span>
              <span className="text-gray-500">Pending: <span className="font-bold text-orange-500">Rs {feeMonth.pending.toLocaleString()}</span></span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full" style={{ width: ((feeMonth.collected / (feeMonth.total || 1)) * 100) + "%" }} />
            </div>
          </div>
          <h4 className="font-bold mb-3 text-gray-800 text-sm">Class-wise Collection</h4>
          <div className="space-y-3">
            {classFeeSummary.map((c: any) => (
              <div key={c.class}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{c.class}</span>
                  <span className="text-gray-500">Rs {(c.collected || 0).toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: ((c.collected / (c.total || 1)) * 100) + "%" }} />
                </div>
              </div>
            ))}
            {classFeeSummary.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No fee data for this month yet.</p>}
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={fadeInUp} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
            <Users size={20} className="text-purple-600" /> Student Distribution
          </h3>
          {classDistribution.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-8">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={classDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={2}>
                    {classDistribution.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 w-full">
                {classDistribution.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                      <span className="text-sm text-gray-700 font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div variants={fadeInUp} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
            <Clock size={20} className="text-orange-500" /> Recent Payments
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
                {recentPayments.map((p: any) => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 text-gray-900 font-medium">{p.studentName}</td>
                    <td className="py-3 text-gray-600">{p.date}</td>
                    <td className="py-3 text-green-600 font-bold text-right">Rs {(p.amount || 0).toLocaleString()}</td>
                  </tr>
                ))}
                {recentPayments.length === 0 && (
                  <tr><td colSpan={3} className="py-6 text-center text-gray-400">No recent payments</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function KpiCard({ title, value, icon, subtitle, color }: any) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    cyan: "bg-cyan-50 text-cyan-600",
  };
  return (
    <motion.div variants={fadeInUp} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-black mt-2 text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1 font-medium">{subtitle}</p>}
          </div>
          <div className={"p-3 rounded-xl " + (colorClasses[color] || colorClasses.blue)}>{icon}</div>
        </div>
      </div>
    </motion.div>
  );
}
