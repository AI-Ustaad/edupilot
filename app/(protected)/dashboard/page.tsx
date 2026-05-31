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

const fadeInUp = { /* ... same ... */ };
const staggerContainer = { /* ... same ... */ };
const cardHover = { /* ... same ... */ };

const CHART_COLORS = ["#FF7D8F", "#64D8FF", "#FF9A9E", "#7EE6A2", "#FFC78B", "#A0E7FF"];

interface DashboardData { /* ... same ... */ }

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [riskStudents, setRiskStudents] = useState<any[]>([]);

  useEffect(() => {
    if (authLoading) return;                      // انتظار کریں جب تک Auth لوڈ نہ ہو

    if (!user?.tenantId) {
      setLoading(false);                          // اگر یوزر نہیں تو بھی سپنر بند کریں
      return;
    }

    const loadDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard");
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();

    fetch("/api/students/risk")
      .then(res => res.json())
      .then(json => { if (json.success) setRiskStudents(json.data); });
  }, [user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600" />
      </div>
    );
  }

  if (!data) return null;

  const attendancePercent = data.todayAttendance.present + data.todayAttendance.absent > 0
    ? ((data.todayAttendance.present / (data.todayAttendance.present + data.todayAttendance.absent)) * 100).toFixed(0)
    : "0";

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-8">
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

      {/* Rest of dashboard JSX as before, exactly like the working version we had */}
      {/* ... (use the same original code you had that worked, with all charts and sections) ... */}
    </motion.div>
  );
}

function KpiCard({ title, value, icon, subtitle }: { title: string; value: string | number; icon: React.ReactNode; subtitle?: string; }) {
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
