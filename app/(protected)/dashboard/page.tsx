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
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const cardHover = {
  rest: { scale: 1, y: 0, transition: { duration: 0.2 } },
  hover: { scale: 1.02, y: -6, transition: { duration: 0.2 } }
};

const CHART_COLORS = ["#FF7D8F", "#64D8FF", "#FF9A9E", "#7EE6A2", "#FFC78B", "#A0E7FF"];

const toYMD = (date: Date) => date.toISOString().split("T")[0];
const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toLocaleDateString("en-US", { weekday: "short" }));
  }
  return days;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalStaff, setTotalStaff] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState({ present: 0, absent: 0 });
  const [attendanceTrend, setAttendanceTrend] = useState<{ day: string; percent: number }[]>([]);
  const [attendanceStats, setAttendanceStats] = useState({ avg: 0, highest: 0, lowest: 100 });
  const [currentMonthFee, setCurrentMonthFee] = useState({ collected: 0, pending: 0, total: 0 });
  const [classFeeSummary, setClassFeeSummary] = useState<{ class: string; collected: number; total: number }[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [classDistribution, setClassDistribution] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    if (!user?.tenantId) return;

    const fetchData = async () => {
      try {
        const studentsRes = await fetch("/api/students");
        const studentsData = await studentsRes.json();
        setTotalStudents(Array.isArray(studentsData) ? studentsData.length : 0);

        const staffRes = await fetch("/api/staff");
        const staffData = await staffRes.json();
        setTotalStaff(Array.isArray(staffData) ? staffData.length : 0);

        const feesRes = await fetch("/api/fees");
        const feesData = await feesRes.json();
        const totalRevenue = Array.isArray(feesData)
          ? feesData.reduce((sum, f) => sum + (Number(f.amountPaid) || 0), 0)
          : 0;
        setRevenue(totalRevenue);

        const today = toYMD(new Date());
        const attRes = await fetch(`/api/attendance?date=${today}`);
        const attData = await attRes.json();
        let present = 0, absent = 0;
        if (Array.isArray(attData)) {
          present = attData.filter((a: any) => a.status === "Present").length;
          absent = attData.filter((a: any) => a.status === "Absent").length;
        }
        setTodayAttendance({ present, absent });

        const startDate = toYMD(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));
        const trendRes = await fetch(`/api/attendance?date>=${startDate}`);
        const trendData = await trendRes.json();
        const map = new Map();
        if (Array.isArray(trendData)) {
          trendData.forEach((doc: any) => {
            const dt = doc.date;
            if (!map.has(dt)) map.set(dt, { present: 0, total: 0 });
            const entry = map.get(dt);
            entry.total++;
            if (doc.status === "Present") entry.present++;
          });
        }
        const days = getLast7Days();
        const trend: { day: string; percent: number }[] = [];
        let totalPercent = 0, maxP = 0, minP = 100;
        for (let i = 0; i < days.length; i++) {
          const date = toYMD(new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000));
          const entry = map.get(date);
          let percent = 0;
          if (entry && entry.total > 0) percent = (entry.present / entry.total) * 100;
          trend.push({ day: days[i], percent: Math.round(percent) });
          totalPercent += percent;
          if (percent > maxP) maxP = percent;
          if (percent < minP) minP = percent;
        }
        setAttendanceTrend(trend);
        setAttendanceStats({
          avg: Math.round(totalPercent / days.length),
          highest: Math.round(maxP),
          lowest: Math.round(minP),
        });

        const currentMonth = new Date().toLocaleString("default", { month: "long", year: "numeric" });
        const monthFees = Array.isArray(feesData)
          ? feesData.filter((f: any) => f.feeMonth === currentMonth)
          : [];
        const collected = monthFees.reduce((sum, f) => sum + (Number(f.amountPaid) || 0), 0);
        const expectedTotal = totalStudents * 5000;
        setCurrentMonthFee({ collected, pending: expectedTotal - collected, total: expectedTotal });

        const classMap = new Map();
        monthFees.forEach((fee: any) => {
          const className = fee.classGrade || "Unknown";
          if (!classMap.has(className)) classMap.set(className, { collected: 0, count: 0 });
          classMap.get(className).collected += Number(fee.amountPaid) || 0;
        });
        const summary = Array.from(classMap.entries()).map(([cls, { collected }]) => ({
          class: cls,
          collected,
          total: 5000,
        })).sort((a, b) => b.collected - a.collected).slice(0, 5);
        setClassFeeSummary(summary);

        const recent = (Array.isArray(feesData) ? feesData : [])
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
          .map((f: any) => ({
            id: f.id,
            studentName: f.studentName,
            amount: Number(f.amountPaid) || 0,
            date: f.feeMonth,
            timestamp: f.createdAt ? new Date(f.createdAt) : new Date(),
          }));
        setRecentPayments(recent);

        const classDistMap = new Map();
        if (Array.isArray(studentsData)) {
          studentsData.forEach((s: any) => {
            const className = s.classGrade || "Unknown";
            classDistMap.set(className, (classDistMap.get(className) || 0) + 1);
          });
        }
        const dist = Array.from(classDistMap.entries()).map(([name, value]) => ({ name, value }));
        setClassDistribution(dist);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.tenantId]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
      </div>
    );
  }

  const attendancePercent =
    todayAttendance.present + todayAttendance.absent > 0
      ? ((todayAttendance.present / (todayAttendance.present + todayAttendance.absent)) * 100).toFixed(0)
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
        <h1 className="text-3xl font-black text-white">
          Command Center
        </h1>
        <p className="text-white/50 mt-1">
          Real‑time overview of your institution
        </p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={fadeInUp} whileHover="hover" initial="rest" animate="rest" custom={cardHover}>
          <KpiCard
            title="Total Students"
            value={totalStudents}
            icon={<Users size={28} />}
            bgClass="bg-primary/20"
            iconColor="text-primary"
          />
        </motion.div>
        <motion.div variants={fadeInUp} whileHover="hover" initial="rest" animate="rest" custom={cardHover}>
          <KpiCard
            title="Total Staff"
            value={totalStaff}
            icon={<Briefcase size={28} />}
            bgClass="bg-secondary/20"
            iconColor="text-secondary"
          />
        </motion.div>
        <motion.div variants={fadeInUp} whileHover="hover" initial="rest" animate="rest" custom={cardHover}>
          <KpiCard
            title="Revenue (Rs)"
            value={revenue.toLocaleString()}
            icon={<DollarSign size={28} />}
            bgClass="bg-success/20"
            iconColor="text-success"
          />
        </motion.div>
        <motion.div variants={fadeInUp} whileHover="hover" initial="rest" animate="rest" custom={cardHover}>
          <KpiCard
            title="Today's Attendance"
            value={`${todayAttendance.present} / ${todayAttendance.present + todayAttendance.absent}`}
            subtitle={`${attendancePercent}% present`}
            icon={<Activity size={28} />}
            bgClass="bg-info/20"
            iconColor="text-info"
          />
        </motion.div>
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={fadeInUp} className="glass-card p-6">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-white">
            <CalendarDays size={20} className="text-primary" /> Weekly Attendance
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={attendanceTrend}>
              <defs>
                <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF7D8F" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF7D8F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis domain={[0, 100]} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  background: "rgba(10,39,66,0.8)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#fff",
                }}
              />
              <Area
                type="monotone"
                dataKey="percent"
                stroke="#FF7D8F"
                strokeWidth={3}
                fill="url(#colorAttendance)"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div><p className="text-white/50 text-sm">Average</p><p className="text-xl font-bold text-white">{attendanceStats.avg}%</p></div>
            <div><p className="text-white/50 text-sm">Highest</p><p className="text-xl font-bold text-success">{attendanceStats.highest}%</p></div>
            <div><p className="text-white/50 text-sm">Lowest</p><p className="text-xl font-bold text-primary">{attendanceStats.lowest}%</p></div>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <CreditCard size={20} className="text-success" /> Fee Collection (Current Month)
          </h3>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white/70">Collected: Rs {currentMonthFee.collected.toLocaleString()}</span>
              <span className="text-white/50">Pending: Rs {currentMonthFee.pending.toLocaleString()}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentMonthFee.collected / (currentMonthFee.total || 1)) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-success h-2.5 rounded-full shadow-glow"
              />
            </div>
          </div>
          <h4 className="font-semibold mb-2 text-white">Class‑wise collection</h4>
          <div className="space-y-2">
            {classFeeSummary.map((c, idx) => (
              <motion.div
                key={c.class}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">{c.class}</span>
                  <span className="text-white/60">Rs {c.collected.toLocaleString()} / {c.total.toLocaleString()}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div
                    className="bg-accent h-1.5 rounded-full"
                    style={{ width: `${(c.collected / (c.total || 1)) * 100}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={fadeInUp} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <Users size={20} className="text-accent" /> Student Distribution by Class
          </h3>
          {classDistribution.length === 0 ? (
            <div className="flex justify-center items-center h-64 text-white/40">No data yet</div>
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <ResponsiveContainer width="100%" height={250} className="md:w-1/2">
                <PieChart>
                  <Pie
                    data={classDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {classDistribution.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {classDistribution.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-white/80">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div variants={fadeInUp} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <Clock size={20} className="text-warning" /> Recent Fee Payments
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-white/50 border-b border-white/10">
                <tr>
                  <th className="p-3 text-left">Student</th>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p, idx) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-white/5"
                  >
                    <td className="p-3 text-white/90">{p.studentName}</td>
                    <td className="p-3 text-white/70">{p.date}</td>
                    <td className="p-3 font-bold text-success">Rs {p.amount.toLocaleString()}</td>
                    <td className="p-3 text-white/60">{p.timestamp.toLocaleDateString()}</td>
                  </motion.tr>
                ))}
                {recentPayments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-white/40">No payments yet</td>
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

// KpiCard Component
function KpiCard({
  title,
  value,
  icon,
  subtitle,
  bgClass,
  iconColor,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  bgClass: string;
  iconColor: string;
}) {
  return (
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
  );
}
