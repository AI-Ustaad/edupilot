"use client";
import { useState } from "react";
import { Loader2, Upload, Film } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useClasses } from "@/hooks/useClasses";
import { useSettings } from "@/hooks/useSettings";
import { useVideos, useUploadVideo } from "@/hooks/useVideos";

export default function TeacherVideoLecturesPage() {
  const [form, setForm] = useState({ title: "", description: "", classGrade: "", subject: "", file: null as File | null });

  const { data: classes = [] } = useClasses();
  const { data: settings } = useSettings();
  const subjects = settings?.subjects || [];
  
  const { data: videos = [], isLoading } = useVideos();
  const uploadMutation = useUploadVideo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.classGrade || !form.subject || !form.file) return alert("Please fill all fields");
    
    const formData = new FormData();
    formData.append("file", form.file);
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("classGrade", form.classGrade);
    formData.append("subject", form.subject);

    uploadMutation.mutate(formData, {
      onSuccess: () => setForm({ title: "", description: "", classGrade: "", subject: "", file: null })
    });
  };

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" size={32} /></div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Upload className="text-blue-600" /> Upload Video Lecture</h1>

      <RequirePermission permissions={[PERMISSIONS.videoLectures.create]}>
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Video Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-gray-50 border rounded-xl p-3" required />
            <input type="text" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-gray-50 border rounded-xl p-3" />
            <select value={form.classGrade} onChange={e => setForm({ ...form, classGrade: e.target.value })} className="bg-gray-50 border rounded-xl p-3" required>
              <option value="">Select Class</option>
              {classes.map((c: any) => <option key={c.id} value={c.classGrade}>{c.classGrade}</option>)}
            </select>
            <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="bg-gray-50 border rounded-xl p-3" required>
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="col-span-2">
              <label className="text-sm font-bold block mb-2">Video File</label>
              <input type="file" accept="video/*" onChange={e => setForm({ ...form, file: e.target.files?.[0] || null })} className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700" required />
            </div>
            <button type="submit" disabled={uploadMutation.isPending} className="col-span-2 bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
              {uploadMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />} Upload Video
            </button>
          </form>
        </div>
      </RequirePermission>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Uploaded Videos</h2>
        {videos.length === 0 ? <div className="bg-gray-50 border rounded-2xl p-8 text-center text-gray-500">No videos uploaded yet.</div> : (
          <div className="grid gap-3">
            {videos.map(v => (
              <div key={v.id} className="bg-white border rounded-xl p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Film className="text-blue-600 w-8 h-8" />
                  <div>
                    <p className="font-bold text-gray-900">{v.title}</p>
                    <p className="text-sm text-gray-500">{v.classGrade} • {v.subject}</p>
                  </div>
                </div>
                <a href={v.videoUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold">Watch Video</a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
