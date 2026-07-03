"use client";
import { useState } from "react";
import { Loader2, Plus, Trash2, CalendarDays } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useAcademicYears, useSaveAcademicYear } from "@/hooks/useAdmin";
import { TableSkeleton } from "@/components/Skeletons";

export default function AcademicYearPage() {
  const { data: years = [], isLoading } = useAcademicYears();
  const saveMutation = useSaveAcademicYear();
  const [form, setForm] = useState({ name: "", startDate: "", endDate: "", isCurrent: false });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(form, { onSuccess: () => setForm({ name: "", startDate: "", endDate: "", isCurrent: false }) });
  };

  if (isLoading) return <div className="p-6"><TableSkeleton rows={4} cols={5} /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black text-slate-800 mb-2">Academic Year Management</h1>
      <p className="text-slate-500 mb-6">Set up school calendar years.</p>

      <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
            <CalendarDays size={20} className="text-blue-600" /> Add New Academic Year
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Year Name (e.g., 2024-2025)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500" required />
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500" required />
            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500" required />
            <label className="flex items-center gap-2 font-bold text-gray-700">
              <input type="checkbox" checked={form.isCurrent} onChange={(e) => setForm({ ...form, isCurrent: e.target.checked })} className="w-4 h-4 text-blue-600" /> Set as Current Year
            </label>
            <button type="submit" disabled={saveMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-bold col-span-2 flex items-center justify-center gap-2 transition disabled:opacity-50">
              {saveMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />} Add Year
            </button>
          </form>
        </div>
      </RequirePermission>

      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-slate-600 font-bold">Year Name</th>
              <th className="p-4 text-slate-600 font-bold">Start Date</th>
              <th className="p-4 text-slate-600 font-bold">End Date</th>
              <th className="p-4 text-slate-600 font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {years.length === 0 ? (
              <tr><td colSpan={4} className="p-10 text-center text-slate-400 font-medium">No academic years added yet.</td></tr>
            ) : (
              years.map((year: any) => (
                <tr key={year.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-slate-800">{year.name}</td>
                  <td className="p-4 text-slate-600 font-medium">{year.startDate}</td>
                  <td className="p-4 text-slate-600 font-medium">{year.endDate}</td>
                  <td className="p-4">
                    {year.isCurrent ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">Current</span>
                    ) : (
                      <span className="text-gray-400 text-xs font-bold">Inactive</span>
                    )}
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
