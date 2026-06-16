"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function SaasAnalytics() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/saas-analytics").then(res => res.json()).then(res => setData(res.tenants || []));
  }, []);

  return (
    <RequirePermission permissions={[PERMISSIONS.analytics.view]}>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-black text-gray-900 mb-6">SaaS Analytics (Super Admin)</h1>
        
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="students" fill="#3b82f6" name="Students" radius={[4, 4, 0, 0]} barSize={40} />
              <Bar dataKey="revenue" fill="#10b981" name="Revenue" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </RequirePermission>
  );
}
