"use client";
import { useTelemetry } from "@/hooks/useTelemetry";
import { Loader2, TrendingUp, Users, DollarSign, Activity, Server } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CardSkeleton } from "@/components/ui/skeleton/CardSkeleton";

export default function TelemetryDashboard() {
  const { data: metrics, isLoading } = useTelemetry();

  if (isLoading) {
    return (
      <div className="p-6 space-y-8">
        <h1 className="text-2xl font-black text-gray-900">SaaS Telemetry & Health</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  const data = metrics || {};

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900">SaaS Telemetry & Health</h1>
        <p className="text-gray-500 text-sm">Real-time business metrics and system performance.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div><p className="text-sm font-medium opacity-90">Total Schools</p><p className="text-3xl font-black mt-2">{data.totalSchools || 0}</p></div>
            <Users size={40} className="opacity-50" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div><p className="text-sm font-medium opacity-90">MRR (Monthly Revenue)</p><p className="text-3xl font-black mt-2">Rs {(data.mrr || 0).toLocaleString()}</p></div>
            <DollarSign size={40} className="opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div><p className="text-sm font-medium opacity-90">Daily Active Users</p><p className="text-3xl font-black mt-2">{data.dau || 0}</p></div>
            <Activity size={40} className="opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div><p className="text-sm font-medium opacity-90">Trial Schools</p><p className="text-3xl font-black mt-2">{data.trialSubscriptions || 0}</p></div>
            <TrendingUp size={40} className="opacity-50" />
          </div>
        </div>
      </div>

      {/* Charts & System Health */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-6">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.revenueTrend || []}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><Server size={20} /> System Health</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-sm font-medium text-gray-600">API Status</span>
              <span className="text-sm font-bold text-green-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Operational
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-sm font-medium text-gray-600">Database Latency</span>
              <span className="text-sm font-bold text-gray-900">{data.systemHealth?.databaseLatency || "N/A"}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-sm font-medium text-gray-600">Error Rate</span>
              <span className="text-sm font-bold text-green-600">{data.systemHealth?.errorRate || "0%"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
