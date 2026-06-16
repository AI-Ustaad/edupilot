"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { Users, UserCheck, DollarSign, AlertTriangle, Loader2, TrendingUp, Calendar } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex flex-col items-center gap-3 text-center">
          <AlertTriangle size={32} />
          <div>
            <p className="font-bold text-lg">Failed to load dashboard</p>
            <p className="text-sm">Please check your connection and try again.</p>
          </div>
        </div>
      </div>
    );
  }

  const { metrics, risks } = data || { metrics: {}, risks: [] };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-end border-b pb-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold text-sm border border-blue-100">
          <Calendar size={16} />
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Students" value={metrics.totalStudents || 0} icon={<Users className="text-blue-600" size={24} />} trend="+12%" color="blue" />
        <MetricCard title="Total Staff" value={metrics.totalStaff || 0} icon={<UserCheck className="text-green-600" size={24} />} trend="+2%" color="green" />
        <MetricCard title="Attendance Rate" value={`${metrics.attendanceRate || 0}%`} icon={<TrendingUp className="text-orange-600" size={24} />} trend="-1%" color="orange" />
        
        {/* 🛡️ Protected Revenue Metric */}
        <RequirePermission permissions={[PERMISSIONS.analytics.view]}>
          <MetricCard title="Total Revenue" value={`Rs. ${(metrics.totalRevenue || 0).toLocaleString()}`} icon={<DollarSign className="text-purple-600" size={24} />} trend="+8%" color="purple" />
        </RequirePermission>
      </div>

      {/* At-Risk Students Section */}
      <RequirePermission permissions={[PERMISSIONS.students.view]}>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <AlertTriangle size={20} className="text-red-500" /> Students at Risk
            </h2>
            <span className="text-xs font-bold bg-red-100 text-red-700 px-3 py-1 rounded-full border border-red-200">
              {risks.length} Alert(s)
            </span>
          </div>
          
          {risks.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-white">
              <p className="font-medium">No students at risk. Great job!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 bg-white">
              {risks.slice(0, 5).map((risk: any, index: number) => (
                <div key={index} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center border border-red-200">
                      <span className="text-red-600 font-bold text-sm">{risk.studentName.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{risk.studentName}</p>
                      <p className="text-xs text-gray-500 font-medium">Risk Score: {risk.riskScore}/100</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{risk.reason}</p>
                    <button className="text-xs text-blue-600 font-bold mt-1 hover:underline">View Profile</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </RequirePermission>
    </div>
  );
}

function MetricCard({ title, value, icon, trend, color }: any) {
  const isPositive = trend.startsWith("+");
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 bg-${color}-50 rounded-xl border border-${color}-100`}>{icon}</div>
        <span className={`text-[10px] tracking-wider font-black px-2 py-1 rounded-md border ${isPositive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {trend}
        </span>
      </div>
      <p className="text-sm text-gray-500 font-bold">{title}</p>
      <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
    </div>
  );
}
