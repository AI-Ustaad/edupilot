"use client";
import { useState, useMemo, useRef } from "react";
import { Loader2, Upload } from "lucide-react";
import { useClasses } from "@/hooks/useClasses";
import { useSettings } from "@/hooks/useSettings";
import { useUploadVideo } from "@/hooks/useVideos";
import { extractUniqueClasses } from "@/lib/utils/formatClassLabel";
import { useToast } from "@/components/ToastProvider";

// B12: the single upload form for video lectures, shared by the Video
// Library (/video-lectures) and the Teacher Lectures page
// (/teacher/video-lectures). Before this fix the form existed only on the
// teacher page, so the Video Library — the page the audit checks — showed
// no upload control at all.
//
// Toasts and list refresh live in useUploadVideo (success/error toast +
// ["videos"] invalidation). This form deliberately passes NO per-call
// callbacks to mutateAsync, so nothing clobbers the hook's invalidation:
// after a successful upload the new lecture appears in the list.
export default function VideoUploadForm() {
  const [form, setForm] = useState({ title: "", description: "", classGrade: "", subject: "", file: null as File | null });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: classes = [] } = useClasses();
  const { data: settings } = useSettings();
  const { showToast } = useToast();
  const subjects = settings?.subjects || [];
  const uniqueClasses = useMemo(() => extractUniqueClasses(classes), [classes]);

  const uploadMutation = useUploadVideo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.classGrade || !form.subject || !form.file) {
      showToast("Please fill all required fields and select a video file.", "info");
      return;
    }

    const formData = new FormData();
    formData.append("file", form.file);
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("classGrade", form.classGrade);
    formData.append("subject", form.subject);

    try {
      await uploadMutation.mutateAsync(formData);
      setForm({ title: "", description: "", classGrade: "", subject: "", file: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      // useUploadVideo already shows the real error toast; nothing to add.
    }
  };

  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" placeholder="Video Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-gray-50 border rounded-xl p-3" required />
        <input type="text" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-gray-50 border rounded-xl p-3" />
        <select value={form.classGrade} onChange={e => setForm({ ...form, classGrade: e.target.value })} className="bg-gray-50 border rounded-xl p-3" required>
          <option value="">Select Class</option>
          {uniqueClasses.map((cls: string) => <option key={cls} value={cls}>{cls}</option>)}
        </select>
        <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="bg-gray-50 border rounded-xl p-3" required>
          <option value="">Select Subject</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="col-span-2">
          <label className="text-sm font-bold block mb-2">Video File</label>
          <input ref={fileInputRef} type="file" accept="video/*" onChange={e => setForm({ ...form, file: e.target.files?.[0] || null })} className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700" required />
        </div>
        <button type="submit" disabled={uploadMutation.isPending} className="col-span-2 bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
          {uploadMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />} Upload Video
        </button>
      </form>
    </div>
  );
}
