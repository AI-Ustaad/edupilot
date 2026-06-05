export const dynamic = 'force-dynamic';
"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, CalendarDays } from "lucide-react";

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

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" size={32} /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black text-slate-800 mb-2">Academic Year Management</h1>
      <p className="text-slate-500 mb-6">Set up school calendar years. The current year will be used for promotions and fee cycles.</p>

      {/* Add Form */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
          <CalendarDays size={20} className="text-primary" /> Add New Academic Year
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            placeholder="Year Name (e.g., 2024-2025)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border rounded-xl p-2 bg-white/60 backdrop-blur-sm"
            required
          />
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="border rounded-xl p-2 bg-white/60 backdrop-blur-sm"
            required
          />
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="border rounded-xl p-2 bg-white/60 backdrop-blur-sm"
            required
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isCurrent}
              onChange={(e) => setForm({ ...form, isCurrent: e.target.checked })}
            />{" "}
            Set as Current Year
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary col-span-2 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />} Add Year
          </button>
        </form>
      </div>

      {/* List of Years */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/20">
            <tr>
              <th className="p-4 text-left text-slate-800">Year Name</th>
              <th className="p-4 text-left text-slate-800">Start Date</th>
              <th className="p-4 text-left text-slate-800">End Date</th>
              <th className="p-4 text-left text-slate-800">Status</th>
              <th className="p-4 text-right text-slate-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {years.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-slate-400">
                  No academic years added yet.
                </td>
              </tr>
            ) : (
              years.map((year) => (
                <tr key={year.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="p-4 font-bold text-slate-800">{year.name}</td>
                  <td className="p-4 text-slate-600">{year.startDate}</td>
                  <td className="p-4 text-slate-600">{year.endDate}</td>
                  <td className="p-4">
                    {year.isCurrent ? (
                      <span className="bg-success/20 text-success px-2 py-1 rounded-full text-xs font-bold">
                        Current
                      </span>
                    ) : (
                      "Inactive"
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {!year.isCurrent && (
                      <button onClick={() => setCurrent(year.id!)} className="text-primary text-sm hover:underline">
                        Set Current
                      </button>
                    )}
                    <button onClick={() => deleteYear(year.id!)} className="text-red-400">
                      <Trash2 size={16} />
                    </button>
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
