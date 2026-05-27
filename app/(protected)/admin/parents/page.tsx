"use client";
import { useState, useEffect } from "react";
import { Loader2, UserPlus } from "lucide-react";

export default function ManageParents() {
  const [students, setStudents] = useState<any[]>([]);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "", studentIds: [] as string[] });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/students").then(res => res.json()).then(data => setStudents(Array.isArray(data) ? data : []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/parents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess("Parent added successfully!");
        setForm({ fullName: "", email: "", password: "", phone: "", studentIds: [] });
        setTimeout(() => setSuccess(""), 3000);
      } else alert("Failed");
    } catch (err) {
      alert("Error");
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (id: string) => {
    setForm(prev => ({
      ...prev,
      studentIds: prev.studentIds.includes(id) ? prev.studentIds.filter(s => s !== id) : [...prev.studentIds, id]
    }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black text-white mb-6">Add Parent</h1>
      {success && <div className="bg-success/20 text-success p-3 rounded-xl mb-4">{success}</div>}
      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
        <input placeholder="Full Name" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50" required />
        <input type="email" placeholder="Email (login)" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50" required />
        <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50" required />
        <input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50" />
        <div className="border border-white/10 rounded-xl p-3">
          <label className="font-bold text-white">Link Students</label>
          <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto">
            {students.map(s => (
              <label key={s.id} className="flex items-center gap-2 text-white/80">
                <input type="checkbox" checked={form.studentIds.includes(s.id)} onChange={() => toggleStudent(s.id)} />
                {s.fullName || s.name} ({s.classGrade})
              </label>
            ))}
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />} Add Parent
        </button>
      </form>
    </div>
  );
}
