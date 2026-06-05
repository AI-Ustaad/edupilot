export const dynamic = 'force-dynamic';
"use client";

import React, { useState, useEffect } from "react";
import {
  Users, Briefcase, DollarSign, Activity, CalendarDays,
  CreditCard, Clock, Eye
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import Link from "next/link";

// Mock Data for Demo
const MOCK_STUDENTS = 1245;
const MOCK_STAFF = 68;
const MOCK_REVENUE = 284500;
const MOCK_ATTENDANCE = { present: 342, absent: 28 };

const MOCK_ATTENDANCE_TREND = [
  { day: "Mon", percent: 92 },
  { day: "Tue", percent: 88 },
  { day: "Wed", percent: 94 },
  { day: "Thu", percent: 90 },
  { day: "Fri", percent: 86 },
  { day: "Sat", percent: 78 },
  { day: "Sun", percent: 0 },
];

const MOCK_CLASS_DISTRIBUTION = [
  { name: "Nursery", value: 120 },
  { name: "Prep", value: 135 },
  { name: "Class 1", value: 142 },
  { name: "Class 2", value: 138 },
  { name: "Class 3", value: 125 },
  { name: "Class 4", value: 130 },
  { name: "Class 5", value: 118 },
];

const MOCK_RECENT_PAYMENTS = [
  { studentName: "Ali Raza", date: "May 2025", amount: 5000, timestamp: new Date() },
  { studentName: "Sana Ahmed", date: "May 2025", amount: 5000, timestamp: new Date() },
  { studentName: "Bilal Khan", date: "April 2025", amount: 5000, timestamp: new Date() },
  { studentName: "Fatima Zara", date: "April 2025", amount: 5000, timestamp: new Date() },
];

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec489a", "#06b6d4"];

export default function DemoDashboard() {
  const [loading, setLoading] = useState(false);

  // Simulate loading for better UX
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500" />
      </div>
    );
  }

  const attendancePercent = ((MOCK_ATTENDANCE.present / (MOCK_ATTENDANCE.present + MOCK_ATTENDANCE.absent)) * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Demo Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-gray-900 font-black text-sm">EP</span>
            </div>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                EduPilot <span className="text-blue-600">Demo</span>
              </h1>
              <p className="text-xs text-slate-500">Interactive Demo – No Login Required</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-200">
              <Eye size={14} className="inline mr-1" /> Demo Mode
            </div>
            <Link href="/signup" className="bg-blue-600 text-gray-900 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-md">
              Start Free Trial →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Warning Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
          <Eye size={24} className="text-blue-500" />
          <p className="text-sm text-blue-700">
            This is a <strong>live demo</strong> showing sample data. To manage your own school,{" "}
            <Link href="/signup" className="font-bold underline">sign up for free</Link>.
          </p>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-black">Command Center (Demo)</h1>
          <p className="text-slate-500">Real‑time overview – sample data only</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <DemoKpiCard title="Total Students" value={MOCK_STUDENTS.toLocaleString()} icon={<Users size={28} />} color="blue" />
          <DemoKpiCard title="Total Staff" value={MOCK_STAFF.toLocaleString()} icon={<Briefcase size={28} />} color="purple" />
          <DemoKpiCard title="Revenue (Rs)" value={MOCK_REVENUE.toLocaleString()} icon={<DollarSign size={28} />} color="green" />
          <DemoKpiCard
            title="Today's Attendance"
            value={`${MOCK_ATTENDANCE.present} / ${MOCK_ATTENDANCE.present + MOCK_ATTENDANCE.absent}`}
            subtitle={`${attendancePercent}% present`}
            icon={<Activity size={28} />}
            color="orange"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <CalendarDays size={20} className="text-blue-500" /> Weekly Attendance (Sample)
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={MOCK_ATTENDANCE_TREND}>
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis domain={[0, 100]} stroke="#64748b" />
                <Tooltip />
                <Line type="monotone" dataKey="percent" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-4 mt-4 text-center">
              <div><p className="text-slate-500 text-sm">Average</p><p className="text-xl font-bold">89%</p></div>
              <div><p className="text-slate-500 text-sm">Highest</p><p className="text-xl font-bold text-green-600">94%</p></div>
              <div><p className="text-slate-500 text-sm">Lowest</p><p className="text-xl font-bold text-red-500">78%</p></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CreditCard size={20} className="text-green-500" /> Fee Collection (Current Month)
            </h3>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Collected: Rs 124,500</span>
                <span>Pending: Rs 75,500</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "62%" }} />
              </div>
              <p className="text-right text-xs mt-1">62% collected</p>
            </div>
            <h4 className="font-semibold mb-2">Class‑wise collection</h4>
            <div className="space-y-2">
              {["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"].map((c, idx) => (
                <div key={c}>
                  <div className="flex justify-between text-sm">
                    <span>{c}</span>
                    <span>Rs {(25000 - idx * 2000).toLocaleString()} / Rs 25000</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${85 - idx * 5}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Users size={20} className="text-purple-500" /> Student Distribution by Class
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <ResponsiveContainer width="100%" height={250} className="md:w-1/2">
                <PieChart>
                  <Pie data={MOCK_CLASS_DISTRIBUTION} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {MOCK_CLASS_DISTRIBUTION.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {MOCK_CLASS_DISTRIBUTION.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-sm font-medium">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Clock size={20} className="text-amber-500" /> Recent Fee Payments (Sample)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr><th className="p-3 text-left">Student</th><th>Month</th><th>Amount</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {MOCK_RECENT_PAYMENTS.map((p, idx) => (
                    <tr key={idx} className="border-b hover:bg-slate-50">
                      <td className="p-3">{p.studentName}</td>
                      <td className="p-3">{p.date}</td>
                      <td className="p-3 font-bold text-green-600">Rs {p.amount.toLocaleString()}</td>
                      <td className="p-3">{p.timestamp.toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-gray-900">
          <h2 className="text-2xl font-bold mb-2">Ready to manage your own school?</h2>
          <p className="mb-4 opacity-90">Get full access to all features – start your free trial today!</p>
          <Link href="/signup" className="inline-block bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:shadow-lg transition">
            Start Free Trial →
          </Link>
        </div>
      </div>
    </div>
  );
}

// Demo KPI Card Component
function DemoKpiCard({ title, value, icon, subtitle, color }: { title: string; value: string | number; icon: React.ReactNode; subtitle?: string; color: "blue" | "purple" | "green" | "orange" }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-black mt-2">{value}</p>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorMap[color]} shadow-sm`}>{icon}</div>
      </div>
    </div>
  );
}
