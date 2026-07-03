"use client";
import { useState } from "react";
import { Clock, AlertCircle, Video, Trash2, Loader2 } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

// 🚀 Layered Architecture Hooks
import { useClasses } from "@/hooks/useClasses";
import { useSettings } from "@/hooks/useSettings";
import { useTimetable, useCreateTimetableEntry, useDeleteTimetableEntry } from "@/hooks/useTimetable";
import { TableSkeleton } from "@/components/Skeletons";

export default function TimetablePage() {
  const [form, setForm] = useState({ day: "", period: "", subject: "", classGrade: "", teacher: "", meetingLink: "" });

  // 1. Fetch Live Data
  const { data: classes = [] } = useClasses();
  const { data: settings } = useSettings();
  const subjects = settings?.subjects || [];
  
  const { data: entries = [], isLoading, error } = useTimetable();
  const createMutation = useCreateTimetableEntry();
  const deleteMutation = useDeleteTimetableEntry();

  const addEntry = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form, {
      onSuccess: () => setForm({ day: "", period: "", subject: "", classGrade: "", teacher: "", meetingLink: "" })
    });
  };

  if (isLoading) return <div className="p-6"><TableSkeleton rows={5} cols={6} /></div>;
  
  if (error) return (
    <div className="flex h-96 items-center justify-center">
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={40} />
        <p className="text-gray-900 font-medium">Failed to load timetable.</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
        <Clock className="text-blue-600" /> Time Table
      </h1>

      <RequirePermission permissions={["timetable.create" as any]}>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Add Entry</h2>
          <form onSubmit={addEntry} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select value={form.day} onChange={e => setForm({...form, day: e.target.value})} className="bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" required>
              <option value="">Select Day</option>
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input placeholder="Period (e.g., 1st)" value={form.period} onChange={e => setForm({...form, period: e.target.value})} className="bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" required />
            <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" required>
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            
            <select value={form.classGrade} onChange={e => setForm({...form, classGrade: e.target.value})} className="bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" required>
              <option value="">Select Class</option>
              {classes.map((c: any) => <option key={c.id} value={c.classGrade}>{c.classGrade}</option>)}
            </select>

            <input placeholder="Teacher Name" value={form.teacher} onChange={e => setForm({...form, teacher: e.target.value})} className="bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" required />
            <input placeholder="Meeting Link (optional)" value={form.meetingLink} onChange={e => setForm({...form, meetingLink: e.target.value})} className="bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
            
            <button type="submit" disabled={createMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold col-span-full transition disabled:opacity-50 flex items-center justify-center gap-2">
              {createMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : null}
              Add Entry
            </button>
          </form>
        </div>
      </RequirePermission>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="p-4 text-gray-600 font-bold">Day</th>
                <th className="p-4 text-gray-600 font-bold">Period</th>
                <th className="p-4 text-gray-600 font-bold">Subject</th>
                <th className="p-4 text-gray-600 font-bold">Class</th>
                <th className="p-4 text-gray-600 font-bold">Teacher</th>
                <th className="p-4 text-gray-600 font-bold">Meeting</th>
                <th className="p-4 text-gray-600 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.length === 0 ? <tr><td colSpan={7} className="p-6 text-center text-gray-400 font-medium">No entries yet.</td></tr> :
              entries.map((e: any) => (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-900">{e.day}</td>
                  <td className="p-4 font-medium text-gray-700">{e.period}</td>
                  <td className="p-4 text-gray-700">{e.subject}</td>
                  <td className="p-4 font-medium text-blue-600">{e.classGrade || e.class}</td>
                  <td className="p-4 text-gray-700">{e.teacher}</td>
                  <td className="p-4">
                    {e.meetingLink ? <a href={e.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg inline-flex items-center gap-1 text-sm font-bold transition"><Video size={16} /> Join</a> : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => deleteMutation.mutate(e.id)} 
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition disabled:opacity-50"
                      disabled={deleteMutation.isPending && deleteMutation.variables === e.id}
                    >
                      {deleteMutation.isPending && deleteMutation.variables === e.id ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16}/>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
