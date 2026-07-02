"use client";
import { useState, useEffect } from "react";
import { Loader2, Plus } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

// 🛡️ Safe Array Helper
const safeArray = (data: any) => Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);

export default function LessonPlannerPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  
  const [form, setForm] = useState({ 
    date: new Date().toISOString().slice(0, 10), 
    classGrade: "",
    subject: "",
    topic: "", 
    objective: "", 
    materials: "", 
    notes: "" 
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const classesRes = await fetch("/api/classes");
        const classesJson = await classesRes.json();
        setClasses(safeArray(classesJson));

        const settingsRes = await fetch("/api/settings");
        const settingsJson = await settingsRes.json();
        setSubjects(safeArray(settingsJson.subjects || settingsJson.data?.subjects));
      } catch (err) {
        console.error(err);
      }
    };
    fetchInitialData();
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const res = await fetch("/api/lesson-plans");
    const data = await res.json();
    setPlans(safeArray(data));
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.topic || !form.objective || !form.classGrade || !form.subject) return;
    setSaving(true);
    try {
      await fetch("/api/lesson-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({ date: new Date().toISOString().slice(0, 10), classGrade: "", subject: "", topic: "", objective: "", materials: "", notes: "" });
      fetchPlans();
    } catch (err) {
      alert("Failed to save lesson plan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" size={32} /></div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-black text-gray-900">Lesson Planner</h1>

      <RequirePermission permissions={[PERMISSIONS.lessonPlans.create]}>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Create Lesson Plan</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="date" 
              value={form.date} 
              onChange={e => setForm({ ...form, date: e.target.value })} 
              className="bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              required 
            />
            
            <select 
              value={form.classGrade} 
              onChange={e => setForm({ ...form, classGrade: e.target.value })} 
              className="bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              required
            >
              <option value="">Select Class</option>
              {classes.map((c: any, idx: number) => <option key={idx} value={c.classGrade}>{c.classGrade}</option>)}
            </select>

            <select 
              value={form.subject} 
              onChange={e => setForm({ ...form, subject: e.target.value })} 
              className="bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              required
            >
              <option value="">Select Subject</option>
              {subjects.map((s: string, idx: number) => <option key={idx} value={s}>{s}</option>)}
            </select>

            <input 
              placeholder="Topic" 
              value={form.topic} 
              onChange={e => setForm({ ...form, topic: e.target.value })} 
              className="bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              required 
            />
            
            <textarea 
              placeholder="Objective" 
              value={form.objective} 
              onChange={e => setForm({ ...form, objective: e.target.value })} 
              className="col-span-2 bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              rows={2} 
              required 
            />
            
            <textarea 
              placeholder="Materials (optional)" 
              value={form.materials} 
              onChange={e => setForm({ ...form, materials: e.target.value })} 
              className="col-span-2 bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              rows={2} 
            />
            
            <textarea 
              placeholder="Notes (optional)" 
              value={form.notes} 
              onChange={e => setForm({ ...form, notes: e.target.value })} 
              className="col-span-2 bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              rows={2} 
            />
            
            <button 
              type="submit" 
              disabled={saving} 
              className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />} Save Lesson Plan
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
              <th className="p-4 text-left font-bold">Subject</th>
              <th className="p-4 text-left font-bold">Topic</th>
              <th className="p-4 text-left font-bold">Objective</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {plans.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-gray-400 font-medium">No lesson plans yet.</td></tr>
            ) : (
              plans.map((p: any, idx: number) => (
                <tr key={p.id || idx} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-900">{p.date}</td>
                  <td className="p-4 text-gray-700 font-medium">{p.classGrade}</td>
                  <td className="p-4 text-gray-700 font-medium">{p.subject}</td>
                  <td className="p-4 text-gray-700 font-medium">{p.topic}</td>
                  <td className="p-4 text-gray-600">{p.objective}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
