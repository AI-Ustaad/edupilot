"use client";
import { useEffect, useState } from "react";
import { Loader2, Clock, Plus, Trash2, AlertCircle } from "lucide-react";

export default function TimetablePage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ day: "", period: "", subject: "", class: "", teacher: "" });

  const fetchEntries = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/timetable");
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load timetable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  const addEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ day: "", period: "", subject: "", class: "", teacher: "" });
        fetchEntries();
      } else {
        alert("Failed to add entry");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="glass-card p-6 text-center">
          <AlertCircle className="mx-auto text-red-400" size={40} />
          <p className="mt-4 text-slate-800">{error}</p>
          <button onClick={fetchEntries} className="btn-primary mt-4">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
        <Clock className="text-primary" /> Time Table
      </h1>

      {/* Add Form */}
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

      {/* Entries List */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-white/20">
            <tr><th className="p-4 text-left text-slate-800">Day</th><th className="p-4">Period</th><th className="p-4">Subject</th><th className="p-4">Class</th><th className="p-4">Teacher</th></tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-slate-400">No entries yet.</td></tr>
            ) : (
              entries.map((e: any) => (
                <tr key={e.id} className="border-b border-white/10">
                  <td className="p-4">{e.day}</td>
                  <td className="p-4">{e.period}</td>
                  <td className="p-4">{e.subject}</td>
                  <td className="p-4">{e.class}</td>
                  <td className="p-4">{e.teacher}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
