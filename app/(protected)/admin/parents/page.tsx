"use client";
import { useState } from "react";
import { Loader2, UserPlus, CheckCircle } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useStudents } from "@/hooks/useStudents";
import { useToast } from "@/components/ToastProvider";
import apiClient from "@/lib/api/client";

export default function ManageParents() {
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const { showToast } = useToast();
  
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "", studentIds: [] as string[] });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post("/admin/parents", form);
      showToast("Parent added successfully!", "success");
      setForm({ fullName: "", email: "", password: "", phone: "", studentIds: [] });
    } catch (err) {
      showToast("Failed to add parent.", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (id: string) => {
    setForm(prev => ({
      ...prev,
      studentIds: prev.studentIds.includes(id) ? prev.studentIds.filter(s => s !== id) : [...prev.studentIds, id]
    }));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Add Parent</h1>
        <p className="text-gray-500 mt-1">Create a parent portal account and link students to them.</p>
      </div>

      <RequirePermission permissions={[PERMISSIONS.parents.create]}>
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Full Name" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500" required />
            <input type="email" placeholder="Email (login)" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500" required />
            <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500" required />
            <input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="border border-gray-200 bg-gray-50 rounded-xl p-4">
            <label className="font-bold text-gray-800 mb-2 block">Link Students (Select all that apply)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 max-h-60 overflow-y-auto bg-white p-3 border border-gray-200 rounded-lg">
              {studentsLoading ? (
                <p className="text-gray-400 text-sm italic p-2 col-span-2 text-center"><Loader2 className="animate-spin inline mr-2" size={14} /> Loading students...</p>
              ) : students.length === 0 ? (
                <p className="text-gray-400 text-sm italic p-2 col-span-2">No students available.</p>
              ) : (
                students.map(s => (
                  <label key={s.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition">
                    <input type="checkbox" checked={form.studentIds.includes(s.id)} onChange={() => toggleStudent(s.id)} className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-gray-700 font-medium">{s.fullName || s.name} <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-1">{s.classGrade}</span></span>
                  </label>
                ))
              )}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />} Add Parent Profile
          </button>
        </form>
      </RequirePermission>
    </div>
  );
}
