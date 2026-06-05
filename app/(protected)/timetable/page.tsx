"use client";
export const dynamic = 'force-dynamic';
import { useEffect, useState } from "react";
import { Loader2, Clock, Plus, Trash2, AlertCircle, Video } from "lucide-react";

export default function TimetablePage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ day: "", period: "", subject: "", class: "", teacher: "", meetingLink: "" });

  const fetchEntries = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/timetable");
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (err: any) { console.error(err); setError("Failed to load timetable."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEntries(); }, []);

  const addEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/timetable", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) { setForm({ day: "", period: "", subject: "", class: "", teacher: "", meetingLink: "" }); fetchEntries(); }
      else alert("Failed to add entry");
    } catch (err) { alert("Network error"); }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
  if (error) return <div className="flex h-96 items-center justify-center"><div className="bg-white border border-gray-200 rounded-xl p-6 text-center"><AlertCircle className="mx-auto text-red-500" size={40} /><p className="mt-4 text-gray-900">{error}</p><button onClick={fetchEntries} className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-4">Retry</button></div></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2"><Clock className="text-blue-600" /> Time Table</h1>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Add Entry</h2>
        <form onSubmit={addEntry} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input placeholder="Day" value={form.day} onChange={e => setForm({...form, day: e.target.value})} className="bg-gray-50 border border-gray-300 rounded-xl p-2 text-gray-900" />
          <input placeholder="Period" value={form.period} onChange={e => setForm({...form, period: e.target.value})} className="bg-gray-50 border border-gray-300 rounded-xl p-2 text-gray-900" />
          <input placeholder="Subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="bg-gray-50 border border-gray-300 rounded-xl p-2 text-gray-900" />
          <input placeholder="Class" value={form.class} onChange={e => setForm({...form, class: e.target.value})} className="bg-gray-50 border border-gray-300 rounded-xl p-2 text-gray-900" />
          <input placeholder="Teacher" value={form.teacher} onChange={e => setForm({...form, teacher: e.target.value})} className="bg-gray-50 border border-gray-300 rounded-xl p-2 text-gray-900" />
          <input placeholder="Meeting Link (optional)" value={form.meetingLink} onChange={e => setForm({...form, meetingLink: e.target.value})} className="bg-gray-50 border border-gray-300 rounded-xl p-2 text-gray-900" />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold col-span-full">Add Entry</button>
        </form>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-200"><tr><th className="p-4 text-left text-gray-600">Day</th><th className="p-4 text-gray-600">Period</th><th className="p-4 text-gray-600">Subject</th><th className="p-4 text-gray-600">Class</th><th className="p-4 text-gray-600">Teacher</th><th className="p-4 text-gray-600">Meeting</th></tr></thead>
          <tbody>
            {entries.length === 0 ? <tr><td colSpan={6} className="p-6 text-center text-gray-400">No entries yet.</td></tr> :
              entries.map((e: any) => (<tr key={e.id} className="border-t border-gray-100"><td className="p-4 text-gray-900">{e.day}</td><td className="p-4">{e.period}</td><td className="p-4">{e.subject}</td><td className="p-4">{e.class}</td><td className="p-4">{e.teacher}</td><td className="p-4">{e.meetingLink ? <a href={e.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline"><Video size={16} className="inline" /> Join</a> : "—"}</td></tr>))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
