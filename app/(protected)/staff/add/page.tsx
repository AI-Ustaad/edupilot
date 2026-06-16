"use client";
import { useState } from "react";
import { Loader2, UserPlus, Save } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function AddStaffPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "teacher", department: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      alert("Staff added successfully!");
      setForm({ name: "", email: "", phone: "", role: "teacher", department: "" });
    } catch (err) {
      alert("Error adding staff");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequirePermission permissions={[PERMISSIONS.staff.create]}>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <UserPlus className="text-blue-600" /> Add New Staff Member
        </h1>
        
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Full Name</label>
              <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Email Address</label>
              <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Phone Number</label>
              <input required type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Role</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
                <option value="teacher">Teacher</option>
                <option value="admin">Administrator</option>
                <option value="accountant">Accountant</option>
                <option value="librarian">Librarian</option>
              </select>
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {loading ? "Saving..." : "Save Staff Record"}
          </button>
        </form>
      </div>
    </RequirePermission>
  );
}
