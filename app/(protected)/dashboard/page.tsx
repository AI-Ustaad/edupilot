"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboardData", user?.tenantId],
    queryFn: async () => {
      const res = await fetch("/api/v1/dashboard");
      if (!res.ok) throw new Error("API Error");
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    },
    enabled: !!user?.tenantId,
  });

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Dashboard data unavailable.</div>;

  // Safe Data Extraction
  const stats = data.data?.stats || data.stats || { students: 0, revenue: 0 };

  return (
    <div className="p-8 grid grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl border">
        <p className="text-sm text-gray-500">Students</p>
        <h2 className="text-2xl font-black">{stats.students}</h2>
      </div>
      <div className="bg-white p-6 rounded-xl border">
        <p className="text-sm text-gray-500">Revenue</p>
        <h2 className="text-2xl font-black">Rs {stats.revenue?.toLocaleString() || 0}</h2>
      </div>
    </div>
  );
}
