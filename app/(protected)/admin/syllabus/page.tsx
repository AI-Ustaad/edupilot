"use client";
import { useState, useEffect, useMemo } from "react";
import { Loader2, Plus, Trash2, Eye, FileText, Video, Image as ImageIcon, Link as LinkIcon, AlertCircle, BookOpen } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function AdminSyllabusPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [classesData, setClassesData] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ classGrade: "", subject: "", title: "", description: "", type: "pdf", fileUrl: "", linkUrl: "" });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 1. Live Classes Fetch کریں (یہ وہی API ہے جو Classes والے پیج میں استعمال ہوتی ہے)
        const classesRes = await fetch("/api/classes");
        if (classesRes.ok) {
          const classesJson = await classesRes.json();
          setClassesData(classesJson.data || []);
        }

        // 2. Subjects Fetch کریں (Settings سے)
        const settingsRes = await fetch("/api/settings");
        if (settingsRes.ok) {
          const settingsJson = await settingsRes.json();
          setSubjects(settingsJson.data?.subjects || settingsJson.subjects || []);
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
      }
    };

    const fetchMaterials = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/syllabus");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMaterials(Array.isArray(data) ? data : (data.data || []));
      } catch (err) {
        setError("Failed to load syllabus materials.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
    fetchMaterials();
  }, []);

  // 🛡️ Live Classes Extract کرنا (Duplicates ہٹا کر)
  const availableClasses = useMemo(() => {
    return Array.from(new Set(classesData.map((c: any) => c.classGrade as string)));
  }, [classesData]);

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
      
      setForm({ classGrade: "", subject: "", title: "", description: "", type: "pdf", fileUrl: "", linkUrl: "" });
      
      // فوراً لسٹ ریفریش کرنا
      const refetchRes = await fetch("/api/syllabus");
      const data = await refetchRes.json();
      setMaterials(Array.isArray(data) ? data : (data.data || []));
      
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
      // فوراً لسٹ ریفریش کرنا
      const refetchRes = await fetch("/api/syllabus");
      const data = await refetchRes.json();
      setMaterials(Array.isArray(data) ? data : (data.data || []));
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

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-black text-slate-800 mb-2">Manage Syllabus &amp; Study Material</h1>
      <p className="text-slate-500 mb-6">Upload PDFs, videos, images, or links -- organised by class and subject.</p>

      <div className="grid md:grid-cols-2 gap-8">
        <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 text-slate-800">Add New Material</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <select 
                required 
                value={form.classGrade} 
                onChange={e => setForm({ ...form, classGrade: e.target.value })} 
                className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Class</option>
                {/* 🛡️ Live Classes Dropdown */}
                {availableClasses.map((c: string) => <option key={c} value={c}>Class {c}</option>)}
              </select>
              
              <select 
                required 
                value={form.subject} 
                onChange={e => setForm({ ...form, subject: e.target.value })} 
                className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Subject</option>
                {/* 🛡️ Live Subjects Dropdown */}
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              
              <input 
                required 
                placeholder="Title" 
                value={form.title} 
                onChange={e => setForm({ ...form, title: e.target.value })} 
                className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
              
              <textarea 
                placeholder="Description (optional)" 
                rows={2} 
                value={form.description} 
                onChange={e => setForm({ ...form, description: e.target.value })} 
                className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
              
              <select 
                value={form.type} 
                onChange={e => setForm({ ...form, type: e.target.value })} 
                className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="pdf">PDF Document</option>
                <option value="video">Video (YouTube/Vimeo)</option>
                <option value="image">Image</option>
                <option value="link">External Link</option>
              </select>
              
              {form.type !== "link" && (
                <input 
                  placeholder="File URL (https://...)" 
                  value={form.fileUrl} 
                  onChange={e => setForm({ ...form, fileUrl: e.target.value })} 
                  className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" 
                  required={form.type !== "link"} 
                />
              )}
              {form.type === "link" && (
                <input 
                  placeholder="Link URL (https://...)" 
                  value={form.linkUrl} 
                  onChange={e => setForm({ ...form, linkUrl: e.target.value })} 
                  className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" 
                  required 
                />
              )}
              
              <button 
                type="submit" 
                disabled={submitting} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />} Add Material
              </button>
            </form>
          </div>
        </RequirePermission>

        {/* Existing Materials List */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm max-h-[600px] overflow-y-auto">
          <h2 className="text-lg font-bold mb-4 text-slate-800">Existing Materials</h2>
          {materials.length === 0 ? (
            <p className="text-slate-400 text-center py-10 font-medium flex flex-col items-center gap-2">
              <BookOpen size={32} />
              No materials added yet.
            </p>
          ) : (
            <div className="space-y-3">
              {materials.map(m => (
                <div key={m.id} className="border border-gray-100 rounded-xl p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition">
                  <div>
                    <p className="font-bold flex items-center gap-2 text-gray-900">{getTypeIcon(m.type)} {m.title}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Class {m.classGrade} - {m.subject}</p>
                  </div>
                  <div className="flex gap-2">
                    <a href={m.fileUrl || m.linkUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition"><Eye size={18} /></a>
                    <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
                      <button onClick={() => deleteItem(m.id)} className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 transition"><Trash2 size={18} /></button>
                    </RequirePermission>
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
