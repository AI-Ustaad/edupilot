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
    setLoading(false);
  };

  const toggleStudent = (id: string) => {
    setForm(prev => ({
      ...prev,
      studentIds: prev.studentIds.includes(id) ? prev.studentIds.filter(s => s !== id) : [...prev.studentIds, id]
    }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black mb-6">Add Parent</h1>
      {success && <div className="bg-green-100 p-3 rounded mb-4">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input placeholder="Full Name" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="w-full border rounded-xl p-2" required />
        <input type="email" placeholder="Email (login)" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border rounded-xl p-2" required />
        <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full border rounded-xl p-2" required />
        <input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border rounded-xl p-2" />
        <div className="border rounded-xl p-3">
          <label className="font-bold">Link Students</label>
          <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto">
            {students.map(s => (
              <label key={s.id} className="flex items-center gap-2">
                <input type="checkbox" checked={form.studentIds.includes(s.id)} onChange={() => toggleStudent(s.id)} />
                {s.fullName} ({s.classGrade})
              </label>
            ))}
          </div>
        </div>
        <button type="submit" disabled={loading} className="bg-blue-600 text-gray-900 px-6 py-2 rounded-xl flex items-center gap-2">
          {loading ? <Loader2 className="animate-spin" /> : <UserPlus size={18} />} Add Parent
        </button>
      </form>
    </div>
  );
}
