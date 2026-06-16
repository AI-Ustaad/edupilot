"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Download, Filter, Calendar, Loader2 } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec489a", "#06b6d4"];

export default function SuperAdminAnalytics() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    const res = await fetch("/api/super-admin/tenants");
    const tenantsList = await res.json();
    setTenants(tenantsList);
    if (tenantsList.length) setSelectedTenant(tenantsList[0].id);
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedTenant) params.append("tenantId", selectedTenant);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const res = await fetch(`/api/super-admin/analytics?${params.toString()}`);
    const result = await res.json();
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    if (selectedTenant) fetchAnalytics();
  }, [selectedTenant, startDate, endDate]);

  const exportToCSV = () => {
    setExporting(true);
    const csvRows = [
      ["Date", "New Students", "Revenue", "Active Users"],
      ...(data.trend || []).map((item: any) => [item.date, item.students, item.revenue, item.users]),
    ];
    const csvContent = csvRows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_${selectedTenant}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  if (loading) {
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
            <select value={selectedTenant} onChange={(e) => setSelectedTenant(e.target.value)} className="w-full border border-gray-300 bg-gray-50 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500">
              {tenants.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.id})</option>)}
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
          <button onClick={fetchAnalytics} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition">
            <Filter size={18} /> Apply Filters
          </button>
          <button onClick={exportToCSV} disabled={exporting} className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold disabled:opacity-50 transition">
            <Download size={18} /> {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition">
            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">Total Students</p>
            <p className="text-3xl font-black text-gray-900 mt-2">{data.totalStudents || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition">
            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">Total Staff</p>
            <p className="text-3xl font-black text-gray-900 mt-2">{data.totalStaff || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition">
            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">Total Revenue</p>
            <p className="text-3xl font-black text-green-600 mt-2">Rs {data.totalRevenue?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition">
            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">Active Users (30d)</p>
            <p className="text-3xl font-black text-purple-600 mt-2">{data.activeUsers || 0}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.trend || []}>
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
              <BarChart data={data.trend || []}>
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
