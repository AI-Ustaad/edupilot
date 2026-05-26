"use client";
import { useEffect, useState } from "react";
import { Loader2, Clock, Plus, Trash2 } from "lucide-react";

export default function TimetablePage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ day: "", period: "", subject: "", class: "", teacher: "" });

  const fetchEntries = async () => {
    const res = await fetch("/api/timetable");
    const data = await res.json();
    setEntries(data.entries || []);
    setLoading(false);
  };

  useEffect(() => { fetchEntries(); }, []);

  const addEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ day: "", period: "", subject: "", class: "", teacher: "" });
    fetchEntries();
  };

  if (loading) return <div className="p-8"><Loader2 className="animate-spin mx-auto" size={32}/></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
        <Clock className="text-primary" /> Time Table
      </h1>
      <div className="glass-card p-6 mb-8">
        <h2 className="text-lg font-bold mb-4 text-slate-800">Add Entry</h2>
        <form onSubmit={addEntry} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input placeholder="Day" value={form.day} onChange={e => setForm({...form, day: e.target.value})} className="bg-white/60 backdrop-blur-sm border border-white/25 rounded-xl p-2" />
          <input placeholder="Period" value={form.period} onChange={e => setForm({...form, period: e.target.value})} className="bg-white/60 backdrop-blur-sm border border-white/25 rounded-xl p-2" />
          <input placeholder="Subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="bg-white/60 backdrop-blur-sm border border-white/25 rounded-xl p-2" />
          <input placeholder="Class" value={form.class} onChange={e => setForm({...form, class: e.target.value})} className="bg-white/60 backdrop-blur-sm border border-white/25 rounded-xl p-2" />
          <input placeholder="Teacher" value={form.teacher} onChange={e => setForm({...form, teacher: e.target.value})} className="bg-white/60 backdrop-blur-sm border border-white/25 rounded-xl p-2" />
          <button type="submit" className="btn-primary col-span-full">Add Entry</button>
        </form>
      </div>
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-white/20">
            <tr><th className="p-4 text-left text-slate-800">Day</th><th className="p-4">Period</th><th className="p-4">Subject</th><th className="p-4">Class</th><th className="p-4">Teacher</th></tr>
          </thead>
          <tbody>
            {entries.map((e: any) => (
              <tr key={e.id} className="border-b border-white/10">
                <td className="p-4">{e.day}</td>
                <td className="p-4">{e.period}</td>
                <td className="p-4">{e.subject}</td>
                <td className="p-4">{e.class}</td>
                <td className="p-4">{e.teacher}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
