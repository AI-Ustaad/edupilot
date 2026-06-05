"use client";
export const dynamic = 'force-dynamic';

import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useBranding } from "@/context/BrandingContext";
import { useQuery } from "@tanstack/react-query";
import {
  Users, Briefcase, DollarSign, Activity, CalendarDays,
  CreditCard, Clock, AlertTriangle, Loader2
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { useTranslations } from "next-intl";

// ... (animations remain same) ...

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const { user, loading: authLoading } = useAuth();
  const branding = useBranding();
  const primaryColor = branding.primaryColor || "#3b82f6";

  // React Query: ڈیٹا کو کیش کر رہا ہے
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboardData", user?.tenantId],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const json = await res.json();
      return json.data;
    },
    enabled: !!user?.tenantId && !authLoading,
  });

  if (isLoading || authLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
      </div>
    );
  }

  if (isError || !data) {
    return <div className="text-center p-10">Error loading dashboard.</div>;
  }

  return (
    <motion.div className="space-y-8">
      {/* KPI Cards section (use data object as before) */}
      {/* ... (باقی UI وہی رہے گا، بس ڈیٹا `data` ویری ایبل سے آئے گا) ... */}
    </motion.div>
  );
}
