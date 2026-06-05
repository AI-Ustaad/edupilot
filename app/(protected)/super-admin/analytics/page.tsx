"use client";
export const dynamic = 'force-dynamic';
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Download, Filter, Calendar, Loader2 } from "lucide-react";

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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-black">Super Admin Analytics Dashboard</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end bg-white p-4 rounded-xl shadow-sm border">
        <div className="w-64">
          <label className="block text-xs font-bold mb-1">Select School</label>
          <select
            value={selectedTenant}
            onChange={(e) => setSelectedTenant(e.target.value)}
            className="w-full border rounded p-2"
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.id})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded p-2"
          />
        </div>
        <button
          onClick={fetchAnalytics}
          className="bg-blue-600 text-gray-900 px-4 py-2 rounded flex items-center gap-2"
        >
          <Filter size={16} /> Apply Filters
        </button>
        <button
          onClick={exportToCSV}
          disabled={exporting}
          className="bg-green-600 text-gray-900 px-4 py-2 rounded flex items-center gap-2"
        >
          <Download size={16} /> {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-slate-500 text-sm">Total Students</p>
          <p className="text-3xl font-black">{data.totalStudents || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-slate-500 text-sm">Total Staff</p>
          <p className="text-3xl font-black">{data.totalStaff || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-slate-500 text-sm">Total Revenue</p>
          <p className="text-3xl font-black">Rs {data.totalRevenue?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-slate-500 text-sm">Active Users (30d)</p>
          <p className="text-3xl font-black">{data.activeUsers || 0}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="font-bold mb-3">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.trend || []}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="font-bold mb-3">New Students (Monthly)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.trend || []}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="students" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Class Distribution (Pie Chart) */}
      {data.classDistribution && data.classDistribution.length > 0 && (
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="font-bold mb-3">Student Distribution by Class</h3>
          <div className="flex flex-wrap items-center justify-center gap-8">
            <ResponsiveContainer width="100%" height={300} className="md:w-1/2">
              <PieChart>
                <Pie
                  data={data.classDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {data.classDistribution.map((_: any, idx: number) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {data.classDistribution.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-sm font-medium">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
