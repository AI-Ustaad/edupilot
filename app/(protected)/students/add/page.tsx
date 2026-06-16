"use client";
import { useState } from "react";
import { Loader2, UserPlus, Save } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function AddStudentPage() {
  const [form, setForm] = useState({ fullName: "", rollNumber: "", classGrade: "", parentName: "", parentPhone: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, admissionStatus: "approved" }),
      });
      alert("Student added successfully!");
      setForm({ fullName: "", rollNumber: "", classGrade: "", parentName: "", parentPhone: "" });
    } catch (err) {
      alert("Error adding student");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900";

  return (
    <RequirePermission permissions={[PERMISSIONS.students.create]}>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2 border-b pb-4">
          <UserPlus className="text-blue-600" /> Admit New Student
        </h1>
        
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Student Full Name</label>
              <input required type="text" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Roll Number / ID</label>
              <input required type="text" value={form.rollNumber} onChange={e => setForm({...form, rollNumber: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Class / Grade</label>
              <input required type="text" value={form.classGrade} onChange={e => setForm({...form, classGrade: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Parent / Guardian Name</label>
              <input required type="text" value={form.parentName} onChange={e => setForm({...form, parentName: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Parent Phone Number</label>
              <input required type="text" value={form.parentPhone} onChange={e => setForm({...form, parentPhone: e.target.value})} className={inputClass} />
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100">
            <button type="submit" disabled={loading} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-sm">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {loading ? "Saving Record..." : "Confirm Admission"}
            </button>
          </div>
        </form>
      </div>
    </RequirePermission>
  );
}
