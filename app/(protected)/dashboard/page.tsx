"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  Users, Briefcase, DollarSign, Activity, CalendarDays,
  CreditCard, Clock
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

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
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.tenantId) return;
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
  }, [user?.tenantId]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
      </div>
    );
  }

  if (!data) return null;

  const attendancePercent =
    data.todayAttendance.present + data.todayAttendance.absent > 0
      ? ((data.todayAttendance.present / (data.todayAttendance.present + data.todayAttendance.absent)) * 100).toFixed(0)
      : "0";

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-8">
      <motion.div variants={fadeInUp}>
        <h1 className="text-3xl font-black text-white">Command Center</h1>
        <p className="text-white/50 mt-1">Real‑time overview of your institution</p>
      </motion.div>

      <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Students" value={data.students} icon={<Users size={28} />} bgClass="bg-primary/20" iconColor="text-primary" />
        <KpiCard title="Total Staff" value={data.staff} icon={<Briefcase size={28} />} bgClass="bg-secondary/20" iconColor="text-secondary" />
        <KpiCard title="Revenue (Rs)" value={data.revenue.toLocaleString()} icon={<DollarSign size={28} />} bgClass="bg-success/20" iconColor="text-success" />
        <KpiCard
          title="Today's Attendance"
          value={`${data.todayAttendance.present} / ${data.todayAttendance.present + data.todayAttendance.absent}`}
          subtitle={`${attendancePercent}% present`}
          icon={<Activity size={28} />}
          bgClass="bg-info/20"
          iconColor="text-info"
        />
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={fadeInUp} className="glass-card p-6">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-white">
            <CalendarDays size={20} className="text-primary" /> Weekly Attendance
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.attendanceTrend}>
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis domain={[0, 100]} stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: "rgba(10,39,66,0.8)", backdropFilter: "blur(10px)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }} />
              <Line type="monotone" dataKey="percent" stroke="#FF7D8F" strokeWidth={3} dot={{ r: 4, fill: "#FF7D8F" }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div><p className="text-white/50 text-sm">Average</p><p className="text-xl font-bold text-white">{data.attendanceStats.avg}%</p></div>
            <div><p className="text-white/50 text-sm">Highest</p><p className="text-xl font-bold text-success">{data.attendanceStats.highest}%</p></div>
            <div><p className="text-white/50 text-sm">Lowest</p><p className="text-xl font-bold text-primary">{data.attendanceStats.lowest}%</p></div>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <CreditCard size={20} className="text-success" /> Fee Collection (Current Month)
          </h3>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white/70">Collected: Rs {data.feeMonth.collected.toLocaleString()}</span>
              <span className="text-white/50">Pending: Rs {data.feeMonth.pending.toLocaleString()}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5">
              <div className="bg-success h-2.5 rounded-full" style={{ width: `${(data.feeMonth.collected / (data.feeMonth.total || 1)) * 100}%` }} />
            </div>
          </div>
          <h4 className="font-semibold mb-2 text-white">Class‑wise collection</h4>
          <div className="space-y-2">
            {data.classFeeSummary.map((c, idx) => (
              <div key={c.class}>
                <div className="flex justify-between text-sm"><span className="text-white/80">{c.class}</span><span className="text-white/60">Rs {c.collected.toLocaleString()}</span></div>
                <div className="w-full bg-white/10 rounded-full h-1.5"><div className="bg-accent h-1.5 rounded-full" style={{ width: `${(c.collected / (c.total || 1)) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={fadeInUp} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <Users size={20} className="text-accent" /> Student Distribution
          </h3>
          {data.classDistribution.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-white/40">No data</div>
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
                    <span className="text-sm text-white/80">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div variants={fadeInUp} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <Clock size={20} className="text-warning" /> Recent Payments
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-white/50 border-b border-white/10">
                <tr><th className="p-3 text-left">Student</th><th>Month</th><th>Amount</th><th>Date</th></tr>
              </thead>
              <tbody>
                {data.recentPayments.map((p) => (
                  <tr key={p.id} className="border-b border-white/5">
                    <td className="p-3 text-white/90">{p.studentName}</td>
                    <td className="p-3 text-white/70">{p.date}</td>
                    <td className="p-3 text-success font-bold">Rs {p.amount.toLocaleString()}</td>
                    <td className="p-3 text-white/60">{new Date(p.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function KpiCard({ title, value, icon, subtitle, bgClass, iconColor }: {
  title: string; value: string | number; icon: React.ReactNode; subtitle?: string; bgClass: string; iconColor: string;
}) {
  return (
    <motion.div variants={fadeInUp} whileHover="hover" initial="rest" animate="rest" custom={cardHover}>
      <div className="glass-card p-6 transition-all duration-300 hover:shadow-glow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-white/50 uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-black mt-2 text-white">{value}</p>
            {subtitle && <p className="text-sm text-white/60 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl ${bgClass} ${iconColor} shadow-lg`}>{icon}</div>
        </div>
      </div>
    </motion.div>
  );
}
