"use client";
import { useState } from "react";
import { Loader2, Plus, Trash2, Eye, FileText, Video, Image as ImageIcon, Link as LinkIcon, BookOpen } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useClasses } from "@/hooks/useClasses";
import { useSettings } from "@/hooks/useSettings";
import { useSyllabus, useCreateSyllabus, useDeleteSyllabus } from "@/hooks/useSyllabus";

export default function AdminSyllabusPage() {
  const [form, setForm] = useState({ classGrade: "", subject: "", title: "", description: "", type: "pdf", fileUrl: "", linkUrl: "" });
  
  const { data: classes = [] } = useClasses();
  const { data: settings } = useSettings();
  const subjects = settings?.subjects || [];
  
  const { data: materials = [], isLoading } = useSyllabus();
  const createMutation = useCreateSyllabus();
  const deleteMutation = useDeleteSyllabus();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form, { onSuccess: () => setForm({ classGrade: "", subject: "", title: "", description: "", type: "pdf", fileUrl: "", linkUrl: "" }) });
  };

  const getTypeIcon = (type: string) => {
    if (type === "pdf") return <FileText size={16} />;
    if (type === "video") return <Video size={16} />;
    if (type === "image") return <ImageIcon size={16} />;
    return <LinkIcon size={16} />;
  };

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-black text-slate-800 mb-2">Manage Syllabus &amp; Study Material</h1>
      <p className="text-slate-500 mb-6">Upload PDFs, videos, images, or links.</p>

      <div className="grid md:grid-cols-2 gap-8">
        <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 text-slate-800">Add New Material</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <select required value={form.classGrade} onChange={e => setForm({ ...form, classGrade: e.target.value })} className="w-full border rounded-xl p-3 bg-gray-50">
                <option value="">Select Class</option>
                {classes.map((c: any) => <option key={c.id} value={c.classGrade}>{c.classGrade}</option>)}
              </select>
              <select required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full border rounded-xl p-3 bg-gray-50">
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input required placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border rounded-xl p-3 bg-gray-50" />
              <textarea placeholder="Description" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded-xl p-3 bg-gray-50" />
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full border rounded-xl p-3 bg-gray-50">
                <option value="pdf">PDF Document</option>
                <option value="video">Video</option>
                <option value="image">Image</option>
                <option value="link">External Link</option>
              </select>
              {form.type !== "link" && <input placeholder="File URL" value={form.fileUrl} onChange={e => setForm({ ...form, fileUrl: e.target.value })} className="w-full border rounded-xl p-3 bg-gray-50" required={form.type !== "link"} />}
              {form.type === "link" && <input placeholder="Link URL" value={form.linkUrl} onChange={e => setForm({ ...form, linkUrl: e.target.value })} className="w-full border rounded-xl p-3 bg-gray-50" required />}
              <button type="submit" disabled={createMutation.isPending} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                {createMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />} Add Material
              </button>
            </form>
          </div>
        </RequirePermission>

        <div className="bg-white border rounded-2xl p-6 shadow-sm max-h-[600px] overflow-y-auto">
          <h2 className="text-lg font-bold mb-4 text-slate-800">Existing Materials</h2>
          {materials.length === 0 ? (
            <p className="text-slate-400 text-center py-10 font-medium flex flex-col items-center gap-2"><BookOpen size={32} /> No materials added yet.</p>
          ) : (
            <div className="space-y-3">
              {materials.map(m => (
                <div key={m.id} className="border rounded-xl p-4 flex justify-between items-center bg-gray-50">
                  <div>
                    <p className="font-bold flex items-center gap-2 text-gray-900">{getTypeIcon(m.type)} {m.title}</p>
                    <p className="text-xs text-slate-500 mt-1">Class {m.classGrade} - {m.subject}</p>
                  </div>
                  <div className="flex gap-2">
                    <a href={m.fileUrl || m.linkUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-50 text-blue-600 p-2 rounded-lg"><Eye size={18} /></a>
                    <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
                      <button onClick={() => deleteMutation.mutate(m.id)} className="bg-red-50 text-red-500 p-2 rounded-lg"><Trash2 size={18} /></button>
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
