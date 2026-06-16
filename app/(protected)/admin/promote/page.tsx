"use client";

import { useState } from "react";
import { Loader2, Users, ArrowUpRight } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function PromoteStudentsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; count?: number } | null>(null);

  const promoteAll = async () => {
    if (!confirm("Are you absolutely sure you want to promote all students to the next academic level? This action modifies the database heavily.")) return;
    
    setLoading(true);
    const res = await fetch("/api/students/promote", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({}) 
    });
    const data = await res.json();
    if (res.ok) {
      setResult({ success: true, count: data.promoted });
    } else {
      setResult({ success: false });
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
        <ArrowUpRight className="text-blue-600" size={28} /> Promote Students
      </h1>
      
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">
        <Users className="mx-auto text-blue-100 mb-4" size={80} />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Academic Year End Promotion</h2>
        <p className="text-gray-500 mb-8 max-w-lg mx-auto">
  This automated process will evaluate all current active students and move them to the next academic level based on your school&apos;s promotion map (e.g., Nursery → Prep → Class 1).
</p>
        {/* 🛡️ Protected Promote Button */}
        <RequirePermission permissions={[PERMISSIONS.students.update]}>
          <button 
            onClick={promoteAll} 
            disabled={loading} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl flex items-center justify-center gap-2 mx-auto font-black shadow-md transition disabled:opacity-50 text-lg"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <ArrowUpRight size={24} />}
            {loading ? "Processing Promotion Map..." : "Promote All Students Now"}
          </button>
        </RequirePermission>

        {result && (
          <div className={`mt-6 p-4 rounded-xl font-bold text-sm inline-block ${result.success ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {result.success ? `🎉 Success! ${result.count} students have been promoted.` : "❌ Promotion failed. Please check logs."}
          </div>
        )}
      </div>
    </div>
  );
}
