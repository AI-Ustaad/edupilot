export const dynamic = 'force-dynamic';
"use client";
import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Eye } from "lucide-react";

export default function AdminSyllabus() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ classGrade: "", subject: "", title: "", description: "", type: "pdf", fileUrl: "", linkUrl: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then(res => res.json()).then(data => {
      setClasses(data.classes || []);
      setSubjects(data.subjects || []);
    });
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    const res = await fetch("/api/syllabus");
    const data = await res.json();
    setMaterials(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/syllabus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ classGrade: "", subject: "", title: "", description: "", type: "pdf", fileUrl: "", linkUrl: "" });
      fetchMaterials();
    } else alert("Failed to add");
    setSubmitting(false);
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this material?")) return;
    await fetch(`/api/syllabus/${id}`, { method: "DELETE" });
    fetchMaterials();
  };

  if (loading) return <div className="p-8"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-black mb-6">Syllabus & Study Center</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Add New Material</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <select required value={form.classGrade} onChange={e => setForm({...form, classGrade: e.target.value})} className="w-full border p-2 rounded">
              <option value="">Select Class</option>
              {classes.map(c => <option key={c}>{c}</option>)}
            </select>
            <select required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full border p-2 rounded">
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s}>{s}</option>)}
            </select>
            <input required placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border p-2 rounded" />
            <textarea placeholder="Description" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border p-2 rounded" />
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full border p-2 rounded">
              <option value="pdf">PDF Document</option>
              <option value="video">Video (YouTube/Vimeo)</option>
              <option value="image">Image</option>
              <option value="link">External Link</option>
            </select>
            {form.type !== "link" && <input placeholder="File URL (e.g., https://...)" value={form.fileUrl} onChange={e => setForm({...form, fileUrl: e.target.value})} className="w-full border p-2 rounded" />}
            {form.type === "link" && <input placeholder="Link URL" value={form.linkUrl} onChange={e => setForm({...form, linkUrl: e.target.value})} className="w-full border p-2 rounded" />}
            <button type="submit" disabled={submitting} className="bg-blue-600 text-gray-900 px-4 py-2 rounded flex items-center gap-2">
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />} Add Material
            </button>
          </form>
        </div>
        <div className="bg-white p-5 rounded-xl shadow overflow-auto max-h-[600px]">
          <h2 className="text-xl font-bold mb-4">Existing Materials</h2>
          {materials.length === 0 ? <p>No materials added yet.</p> : (
            <div className="space-y-3">
              {materials.map(m => (
                <div key={m.id} className="border rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold">{m.title}</p>
                    <p className="text-sm text-slate-500">{m.classGrade} - {m.subject} ({m.type})</p>
                  </div>
                  <div className="flex gap-2">
                    <a href={m.fileUrl || m.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600"><Eye size={18} /></a>
                    <button onClick={() => deleteItem(m.id)} className="text-red-500"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
