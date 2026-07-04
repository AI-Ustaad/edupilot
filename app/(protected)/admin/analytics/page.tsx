"use client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react"; // 🛡️ Fix: Loader2 lucide-react سے Import ہوگا
import RequirePermission from "@/components/RequirePermission";
import apiClient from "@/lib/api/client";
import { safeObject } from "@/lib/api/safeResponse";
import { useAuth } from "@/context/AuthContext";

export default function AdminAnalyticsPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  const { data: analyticsData = {}, isLoading } = useQuery({
    queryKey: ["analytics", tenantId],
    queryFn: async () => safeObject(await apiClient.get("/analytics")),
  });

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  const trend = analyticsData.trend || [];

  return (
    <RequirePermission permissions={["analytics.view" as any]}>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-black text-gray-900">School Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">Total Students</p>
            <p className="text-3xl font-black text-gray-900 mt-2">{analyticsData.totalStudents || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">Total Staff</p>
            <p className="text-3xl font-black text-gray-900 mt-2">{analyticsData.totalStaff || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">Total Revenue</p>
            <p className="text-3xl font-black text-green-600 mt-2">Rs {(analyticsData.totalRevenue || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">Active Users</p>
            <p className="text-3xl font-black text-purple-600 mt-2">{analyticsData.activeUsers || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-6">Revenue & Enrollment Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trend}>
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="students" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </RequirePermission>
  );
}
