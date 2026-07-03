"use client";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Download, Loader2 } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";

// 🚀 Layered Architecture Hooks
import { useTenants, useAnalytics } from "@/hooks/useAnalytics";
import { useExportCSV } from "@/hooks/useReports";

export default function SuperAdminAnalytics() {
  const [selectedTenant, setSelectedTenant] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 1. Fetch Tenants List
  const { data: tenants = [], isLoading: tenantsLoading } = useTenants();

  // 2. Fetch Analytics Data based on selected Tenant & Dates
  const { data: analyticsData = {}, isLoading: dataLoading } = useAnalytics(selectedTenant, startDate, endDate);
  const exportMutation = useExportCSV();
  
  const trend = analyticsData.trend || [];
  const totalStudents = analyticsData.totalStudents || 0;
  const totalStaff = analyticsData.totalStaff || 0;
  const totalRevenue = analyticsData.totalRevenue || 0;
  const activeUsers = analyticsData.activeUsers || 0;

  const handleExport = () => {
    exportMutation.mutate({ 
      endpoint: "/super-admin/analytics/export", 
      params: { tenantId: selectedTenant, startDate, endDate } 
    });
  };

  if (tenantsLoading || dataLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <RequirePermission permissions={["analytics.view" as any]}>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-black text-gray-900">Super Admin Analytics Dashboard</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-end bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="w-full md:w-64">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select School</label>
            <select 
              value={selectedTenant} 
              onChange={(e) => setSelectedTenant(e.target.value)} 
              className="w-full border border-gray-300 bg-gray-50 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Global (All Schools)</option>
              {tenants.map((t: any) => <option key={t.id} value={t.id}>{t.name} ({t.id})</option>)}
            </select>
          </div>
          <div className="w-full md:w-auto">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border border-gray-300 bg-gray-50 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="w-full md:w-auto">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border border-gray-300 bg-gray-50 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={handleExport} disabled={exportMutation.isPending} className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold disabled:opacity-50 transition">
            <Download size={18} /> {exportMutation.isPending ? "Exporting..." : "Export CSV"}
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">Total Students</p>
            <p className="text-3xl font-black text-gray-900 mt-2">{totalStudents}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">Total Staff</p>
            <p className="text-3xl font-black text-gray-900 mt-2">{totalStaff}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">Total Revenue</p>
            <p className="text-3xl font-black text-green-600 mt-2">Rs {totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">Active Users (30d)</p>
            <p className="text-3xl font-black text-purple-600 mt-2">{activeUsers}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trend}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6">New Students (Monthly)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trend}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="students" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </RequirePermission>
  );
}
