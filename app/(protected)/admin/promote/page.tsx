export const dynamic = 'force-dynamic';
"use client";
import { useState } from "react";
import { Loader2, Users } from "lucide-react";

export default function PromoteStudentsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; count?: number } | null>(null);

  const promoteAll = async () => {
    setLoading(true);
    const res = await fetch("/api/students/promote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    const data = await res.json();
    if (res.ok) setResult({ success: true, count: data.promoted });
    else setResult({ success: false });
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black mb-4">Promote Students to Next Class</h1>
      <p className="mb-6">This will move all students to the next academic level based on the promotion map (Nursery→Prep→Class 1...).</p>
      <button onClick={promoteAll} disabled={loading} className="bg-blue-600 text-gray-900 px-6 py-2 rounded-xl flex items-center gap-2">
        {loading ? <Loader2 className="animate-spin" size={18} /> : <Users size={18} />}
        {loading ? "Promoting..." : "Promote All Students"}
      </button>
      {result && (
        <div className={`mt-4 p-3 rounded ${result.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {result.success ? `${result.count} students promoted successfully.` : "Promotion failed."}
        </div>
      )}
    </div>
  );
}
