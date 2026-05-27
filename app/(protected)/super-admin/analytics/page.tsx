"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

export default function SaasAnalytics() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then(res => res.json())
      .then(res => {
        setData(Array.isArray(res.tenants) ? res.tenants : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-primary" size={40}/></div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black text-white mb-6">SaaS Analytics (Super Admin)</h1>
      <div className="glass-card p-6">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(10,39,66,0.9)",
                backdropFilter: "blur(10px)",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
              }}
            />
            <Bar dataKey="students" fill="#FF7D8F" name="Students" radius={[8,8,0,0]} />
            <Bar dataKey="revenue" fill="#64D8FF" name="Revenue" radius={[8,8,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
