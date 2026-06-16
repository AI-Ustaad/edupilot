"use client";
import { useEffect, useState } from "react";
import { Loader2, Check, X } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function AdmissionsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/students")
      .then(res => res.json())
      .then(data => {
        const pending = Array.isArray(data) ? data.filter((s: any) => !s.admissionStatus || s.admissionStatus === "pending") : [];
        setStudents(pending);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (studentId: string, status: string) => {
    await fetch("/api/admissions/approve", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, status }),
    });
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={32} /></div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Admission Approvals</h1>
      {students.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-400 font-medium">No pending admissions.</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 text-gray-600 font-bold">Name</th>
                <th className="p-4 text-gray-600 font-bold">Class</th>
                <th className="p-4 text-gray-600 font-bold">Roll No</th>
                <th className="p-4 text-right text-gray-600 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-900">{s.fullName || s.name}</td>
                  <td className="p-4 text-gray-700 font-medium">{s.classGrade}</td>
                  <td className="p-4 text-gray-700 font-medium">{s.rollNumber}</td>
                  <td className="p-4 text-right space-x-2">
                    {/* 🛡️ Protected Approval Buttons */}
                    <RequirePermission permissions={[PERMISSIONS.students.update]}>
                      <button onClick={() => handleAction(s.id, "approved")} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm">
                        <Check size={16} className="inline mr-1" /> Approve
                      </button>
                      <button onClick={() => handleAction(s.id, "rejected")} className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold transition">
                        <X size={16} className="inline mr-1" /> Reject
                      </button>
                    </RequirePermission>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
