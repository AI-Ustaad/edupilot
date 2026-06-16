"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, CalendarDays } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

interface AcademicYear {
  id?: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export default function AcademicYearPage() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", startDate: "", endDate: "", isCurrent: false });

  const fetchYears = async () => {
    try {
      const res = await fetch("/api/academic-year");
      const data = await res.json();
      setYears(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setYears([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.startDate || !form.endDate) {
      alert("Please fill all fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/academic-year", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ name: "", startDate: "", endDate: "", isCurrent: false });
        fetchYears();
      } else {
        alert("Failed to add academic year");
      }
    } catch (err) {
      alert("Error");
    } finally {
      setSubmitting(false);
    }
  };

  const setCurrent = async (id: string) => {
    await fetch(`/api/academic-year/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCurrent: true }),
    });
    fetchYears();
  };

  const deleteYear = async (id: string) => {
    if (!confirm("Delete this academic year?")) return;
    await fetch(`/api/academic-year/${id}`, { method: "DELETE" });
    fetchYears();
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={32} /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black text-slate-800 mb-2">Academic Year Management</h1>
      <p className="text-slate-500 mb-6">Set up school calendar years. The current year will be used for promotions and fee cycles.</p>

      {/* 🛡️ Protected Add Form */}
      <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
            <CalendarDays size={20} className="text-blue-600" /> Add New Academic Year
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Year Name (e.g., 2024-2025)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <label className="flex items-center gap-2 font-bold text-gray-700">
              <input
                type="checkbox"
                checked={form.isCurrent}
                onChange={(e) => setForm({ ...form, isCurrent: e.target.checked })}
                className="w-4 h-4 text-blue-600"
              />{" "}
              Set as Current Year
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-bold col-span-2 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />} Add Year
            </button>
          </form>
        </div>
      </RequirePermission>

      {/* List of Years */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-slate-600 font-bold">Year Name</th>
              <th className="p-4 text-slate-600 font-bold">Start Date</th>
              <th className="p-4 text-slate-600 font-bold">End Date</th>
              <th className="p-4 text-slate-600 font-bold">Status</th>
              <th className="p-4 text-right text-slate-600 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {years.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-slate-400 font-medium">
                  No academic years added yet.
                </td>
              </tr>
            ) : (
              years.map((year) => (
                <tr key={year.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-slate-800">{year.name}</td>
                  <td className="p-4 text-slate-600 font-medium">{year.startDate}</td>
                  <td className="p-4 text-slate-600 font-medium">{year.endDate}</td>
                  <td className="p-4">
                    {year.isCurrent ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                        Current
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs font-bold">Inactive</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-3">
                    {/* 🛡️ Protected Action Buttons */}
                    <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
                      {!year.isCurrent && (
                        <button onClick={() => setCurrent(year.id!)} className="text-blue-600 font-bold text-sm hover:underline">
                          Set Current
                        </button>
                      )}
                      <button onClick={() => deleteYear(year.id!)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </RequirePermission>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
