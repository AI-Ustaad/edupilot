"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  Users, Briefcase, DollarSign, Activity, CalendarDays,
  CreditCard, Clock, AlertTriangle,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { useTranslations } from "next-intl";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -6 }
};

const CHART_COLORS = ["#FF7D8F", "#64D8FF", "#FF9A9E", "#7EE6A2", "#FFC78B", "#A0E7FF"];

interface DashboardData {
  students: number;
  staff: number;
  revenue: number;
  todayAttendance: { present: number; absent: number };
  attendanceTrend: { day: string; percent: number }[];
  attendanceStats: { avg: number; highest: number; lowest: number };
  feeMonth: { collected: number; pending: number; total: number };
  classFeeSummary: { class: string; collected: number; total: number }[];
  recentPayments: { id: string; studentName: string; amount: number; date: string; timestamp: string }[];
  classDistribution: { name: string; value: number }[];
}

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [riskStudents, setRiskStudents] = useState<any[]>([]);

  useEffect(() => {
    if (authLoading) return;           // auth لوڈ ہونے تک رکیں

    if (!user?.tenantId) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/dashboard");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          console.error("Dashboard API error:", json.message);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();

    fetch("/api/students/risk")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setRiskStudents(json.data);
      });
  }, [user, authLoading]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600" />
      </div>
    );
  }

  if (!data) return null;

  const attendancePercent =
    data.todayAttendance.present + data.todayAttendance.absent > 0
      ? ((data.todayAttendance.present / (data.todayAttendance.present + data.todayAttendance.absent)) * 100).toFixed(0)
      : "0";

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeInUp}>
        <h1 className="text-3xl font-black text-gray-900">{t("title")}</h1>
        <p className="text-gray-500 mt-1">{t("subtitle")}</p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title={t("totalStudents")} value={data.students} icon={<Users size={28} className="text-blue-600" />} />
        <KpiCard title={t("totalStaff")} value={data.staff} icon={<Briefcase size={28} className="text-purple-600" />} />
        <KpiCard title={t("revenue")} value={data.revenue.toLocaleString()} icon={<DollarSign size={28} className="text-green-600" />} />
        <KpiCard
          title={t("todayAttendance")}
          value={`${data.todayAttendance.present} / ${data.todayAttendance.present + data.todayAttendance.absent}`}
          subtitle={`${attendancePercent}% present`}
          icon={<Activity size={28} className="text-cyan-600" />}
        />
      </motion.div>

      {/* At Risk Students */}
      {riskStudents.length > 0 && (
        <motion.div variants={fadeInUp} className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-600" /> {t("atRisk")} ({riskStudents.length})
          </h2>
          <div className="space-y-3">
            {riskStudents.map((student: any) => (
              <div key={student.id} className="flex justify-between items-center bg-white border border-red-100 rounded-xl p-4">
                <div>
                  <p className="font-semibold text-gray-900">{student.fullName || student.name}</p>
                  <p className="text-sm text-gray-500">{student.classGrade} {student.section || ""}</p>
                </div>
                <div className="flex gap-4 text-sm items-center">
                  <span className="text-red-600 font-bold">Att: {student.attendance}%</span>
                  <span className="text-orange-600 font-bold">Marks: {student.marks}%</span>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">{student.riskReason}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={fadeInUp} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-900">
            <CalendarDays size={20} className="text-blue-600" /> {t("weeklyAttendance")}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.attendanceTrend}>
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis domain={[0, 100]} stroke="#9ca3af" />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", color: "#000" }} />
              <Line type="monotone" dataKey="percent" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6" }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div><p className="text-gray-500 text-sm">Average</p><p className="text-xl font-bold text-gray-900">{data.attendanceStats.avg}%</p></div>
            <div><p className="text-gray-500 text-sm">Highest</p><p className="text-xl font-bold text-green-600">{data.attendanceStats.highest}%</p></div>
            <div><p className="text-gray-500 text-sm">Lowest</p><p className="text-xl font-bold text-red-500">{data.attendanceStats.lowest}%</p></div>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
            <CreditCard size={20} className="text-green-600" /> {t("feeCollection")} (Current Month)
          </h3>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Collected: Rs {data.feeMonth.collected.toLocaleString()}</span>
              <span className="text-gray-500">Pending: Rs {data.feeMonth.pending.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(data.feeMonth.collected / (data.feeMonth.total || 1)) * 100}%` }} />
            </div>
          </div>
          <h4 className="font-semibold mb-2 text-gray-900">Class‑wise collection</h4>
          <div className="space-y-2">
            {data.classFeeSummary.map((c, idx) => (
              <div key={c.class}>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">{c.class}</span>
                  <span className="text-gray-500">Rs {c.collected.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(c.collected / (c.total || 1)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={fadeInUp} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
            <Users size={20} className="text-purple-600" /> {t("studentDistribution")}
          </h3>
          {data.classDistribution.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">{t("noData")}</div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-8">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={data.classDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {data.classDistribution.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {data.classDistribution.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                    <span className="text-sm text-gray-700">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div variants={fadeInUp} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
            <Clock size={20} className="text-orange-500" /> {t("recentPayments")}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="p-3 text-left">Student</th>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentPayments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100">
                    <td className="p-3 text-gray-900 font-medium">{p.studentName}</td>
                    <td className="p-3 text-gray-600">{p.date}</td>
                    <td className="p-3 text-green-600 font-bold">Rs {p.amount.toLocaleString()}</td>
                    <td className="p-3 text-gray-500">{new Date(p.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))}
                {data.recentPayments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-400">{t("noData")}</td>
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

// KPI Card component
function KpiCard({
  title,
  value,
  icon,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <motion.div variants={fadeInUp} whileHover="hover" initial="rest" animate="rest" custom={cardHover}>
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className="p-2 rounded-lg bg-gray-100">{icon}</div>
        </div>
      </div>
    </motion.div>
  );
}
