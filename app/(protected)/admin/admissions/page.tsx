"use client";
export const dynamic = 'force-dynamic';
import { useEffect, useState } from "react";
import { Loader2, Check, X } from "lucide-react";

export default function AdmissionsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/students")
      .then(res => res.json())
      .then(data => {
        // فرض کریں کہ admissionStatus موجود ہے، اگر نہیں تو "pending" مان لیں
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

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" size={32} /></div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Admission Approvals</h1>
      {students.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-400">No pending admissions.</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-gray-600">Name</th>
                <th className="text-gray-600">Class</th>
                <th className="text-gray-600">Roll No</th>
                <th className="text-right text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} className="border-t border-gray-200">
                  <td className="p-4 font-bold text-gray-900">{s.fullName || s.name}</td>
                  <td className="text-gray-700">{s.classGrade}</td>
                  <td className="text-gray-700">{s.rollNumber}</td>
                  <td className="text-right space-x-2">
                    <button onClick={() => handleAction(s.id, "approved")} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm">
                      <Check size={16} className="inline" /> Approve
                    </button>
                    <button onClick={() => handleAction(s.id, "rejected")} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm">
                      <X size={16} className="inline" /> Reject
                    </button>
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
