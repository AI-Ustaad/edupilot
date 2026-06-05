export const dynamic = 'force-dynamic';
"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function SaasAnalytics() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch("/api/saas-analytics").then(res => res.json()).then(res => setData(res.tenants || []));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black mb-6">SaaS Analytics (Super Admin)</h1>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="students" fill="#3b82f6" name="Students" />
          <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
