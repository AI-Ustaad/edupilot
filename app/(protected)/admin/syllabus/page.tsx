"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Eye, FileText, Video, Image as ImageIcon, Link as LinkIcon, AlertCircle } from "lucide-react";

export default function AdminSyllabusPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    classGrade: "",
    subject: "",
    title: "",
    description: "",
    type: "pdf",
    fileUrl: "",
    linkUrl: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setClasses(data.classes || []);
          setSubjects(data.subjects || []);
        }
      } catch (err) {
        console.error("Settings error:", err);
      }
    };
    fetchSettings();
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/syllabus");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMaterials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load syllabus materials. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.classGrade || !form.subject || !form.title) {
      alert("Please fill all required fields");
      return;
    }
    if (form.type !== "link" && !form.fileUrl) {
      alert("Please provide a file URL");
      return;
    }
    if (form.type === "link" && !form.linkUrl) {
      alert("Please provide a link URL");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to add");
      setForm({
        classGrade: "",
        subject: "",
        title: "",
        description: "",
        type: "pdf",
        fileUrl: "",
        linkUrl: "",
      });
      await fetchMaterials();
    } catch (err) {
      alert("Failed to add material");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this material?")) return;
    try {
      await fetch(`/api/syllabus/${id}`, { method: "DELETE" });
      await fetchMaterials();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === "pdf") return <FileText size={16} />;
    if (type === "video") return <Video size={16} />;
    if (type === "image") return <ImageIcon size={16} />;
    return <LinkIcon size={16} />;
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
      <div className="p-8 text-center">
        <div className="glass-card p-6 inline-block">
          <AlertCircle className="inline mr-2 text-red-400" size={20} />
          <span className="text-slate-800">{error}</span>
          <button onClick={fetchMaterials} className="mt-4 btn-primary block mx-auto">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-black text-slate-800 mb-2">Manage Syllabus & Study Material</h1>
      <p className="text-slate-500 mb-6">Upload PDFs, videos, images, or links -- organised by class and subject.</p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Add Material Form */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold mb-4 text-slate-800">Add New Material</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <select required value={form.classGrade} onChange={e => setForm({ ...form, classGrade: e.target.value })} className="w-full border rounded-xl p-2 bg-white/60 backdrop-blur-sm">
              <option value="">Select Class</option>
              {classes.map(c => <option key={c}>{c}</option>)}
            </select>
            <select required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full border rounded-xl p-2 bg-white/60 backdrop-blur-sm">
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s}>{s}</option>)}
            </select>
            <input required placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border rounded-xl p-2 bg-white/60 backdrop-blur-sm" />
            <textarea placeholder="Description (optional)" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded-xl p-2 bg-white/60 backdrop-blur-sm" />
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full border rounded-xl p-2 bg-white/60 backdrop-blur-sm">
              <option value="pdf">PDF Document</option>
              <option value="video">Video (YouTube/Vimeo)</option>
              <option value="image">Image</option>
              <option value="link">External Link</option>
            </select>
            {form.type !== "link" && (
              <input placeholder="File URL (https://...)" value={form.fileUrl} onChange={e => setForm({ ...form, fileUrl: e.target.value })} className="w-full border rounded-xl p-2 bg-white/60 backdrop-blur-sm" required={form.type !== "link"} />
            )}
            {form.type === "link" && (
              <input placeholder="Link URL (https://...)" value={form.linkUrl} onChange={e => setForm({ ...form, linkUrl: e.target.value })} className="w-full border rounded-xl p-2 bg-white/60 backdrop-blur-sm" required />
            )}
            <button type="submit" disabled={submitting} className="w-full btn-primary py-2 rounded flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />} Add Material
            </button>
          </form>
        </div>

        {/* Materials List */}
        <div className="glass-card p-6 max-h-[600px] overflow-y-auto">
          <h2 className="text-lg font-bold mb-4 text-slate-800">Existing Materials</h2>
          {materials.length === 0 ? (
            <p className="text-slate-400 text-center py-10">No materials added yet.</p>
          ) : (
            <div className="space-y-3">
              {materials.map(m => (
                <div key={m.id} className="border border-white/20 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold flex items-center gap-1">{getTypeIcon(m.type)} {m.title}</p>
                    <p className="text-xs text-slate-500">{m.classGrade} - {m.subject}</p>
                  </div>
                  <div className="flex gap-2">
                    <a href={m.fileUrl || m.linkUrl} target="_blank" rel="noopener noreferrer" className="text-primary"><Eye size={18} /></a>
                    <button onClick={() => deleteItem(m.id)} className="text-red-400"><Trash2 size={18} /></button>
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
