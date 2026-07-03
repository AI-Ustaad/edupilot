"use client";
import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useClasses } from "@/hooks/useClasses";
import { useSettings } from "@/hooks/useSettings";
import { useLessonPlans, useCreateLessonPlan } from "@/hooks/useTeacher";
import { TableSkeleton } from "@/components/Skeletons";

export default function LessonPlannerPage() {
  const { data: plans = [], isLoading } = useLessonPlans();
  const { data: classes = [] } = useClasses();
  const { data: settings } = useSettings();
  const subjects = settings?.subjects || [];
  const createMutation = useCreateLessonPlan();

  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), classGrade: "", subject: "", topic: "", objective: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form, { onSuccess: () => setForm({ date: new Date().toISOString().slice(0, 10), classGrade: "", subject: "", topic: "", objective: "" }) });
  };

  if (isLoading) return <div className="p-8"><TableSkeleton rows={4} cols={3} /></div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-black text-gray-900">Lesson Planner</h1>

      <RequirePermission permissions={[PERMISSIONS.lessonPlans.create]}>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Create Lesson Plan</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="bg-gray-50 border rounded-xl p-3" required />
            <select value={form.classGrade} onChange={e => setForm({ ...form, classGrade: e.target.value })} className="bg-gray-50 border rounded-xl p-3" required>
              <option value="">Select Class</option>
              {classes.map((c: any) => <option key={c.id} value={c.classGrade}>{c.classGrade}</option>)}
            </select>
            <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="bg-gray-50 border rounded-xl p-3" required>
              <option value="">Select Subject</option>
              {subjects.map((s: string) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input placeholder="Topic" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} className="bg-gray-50 border rounded-xl p-3" required />
            <textarea placeholder="Objective" value={form.objective} onChange={e => setForm({ ...form, objective: e.target.value })} className="col-span-2 bg-gray-50 border rounded-xl p-3" rows={2} required />
            <button type="submit" disabled={createMutation.isPending} className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
              {createMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />} Save Lesson Plan
            </button>
          </form>
        </div>
      </RequirePermission>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="p-4 text-left font-bold">Date</th>
              <th className="p-4 text-left font-bold">Class</th>
              <th className="p-4 text-left font-bold">Topic</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {plans.length === 0 ? (
              <tr><td colSpan={3} className="p-6 text-center text-gray-400">No lesson plans yet.</td></tr>
            ) : (
              plans.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-900">{p.date}</td>
                  <td className="p-4 text-gray-700 font-medium">{p.classGrade}</td>
                  <td className="p-4 text-gray-700 font-medium">{p.topic}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
