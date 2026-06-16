"use client";
import { useEffect, useState } from "react";
import { Loader2, Upload, Film } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function TeacherVideoLecturesPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    classGrade: "",
    subject: "",
    file: null as File | null,
  });

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setClasses(data.classes || []);
        setSubjects(data.subjects || []);
      });
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const res = await fetch("/api/video-lectures");
    const data = await res.json();
    setVideos(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.classGrade || !form.subject || !form.file) {
      alert("Please fill all fields and select a video file");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", form.file);
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("classGrade", form.classGrade);
      formData.append("subject", form.subject);

      const res = await fetch("/api/video-lectures", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        alert("Video uploaded successfully!");
        setForm({ title: "", description: "", classGrade: "", subject: "", file: null });
        fetchVideos();
      } else {
        const err = await res.json();
        alert("Error: " + err.message);
      }
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" size={32} /></div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Upload className="text-blue-600" /> Upload Video Lecture</h1>

      {/* 🛡️ Protected Upload Form */}
      <RequirePermission permissions={[PERMISSIONS.videoLectures.create]}>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">New Video</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Video Title" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" required />
            <input type="text" placeholder="Description (optional)" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
            <select value={form.classGrade} onChange={e => setForm({ ...form, classGrade: e.target.value })}
              className="bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" required>
              <option value="">Select Class</option>
              {classes.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
              className="bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" required>
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s}>{s}</option>)}
            </select>
            <div className="col-span-2">
              <label className="text-sm font-bold text-gray-700 mb-2 block">Video File (MP4, WebM, etc.)</label>
              <input type="file" accept="video/*" onChange={e => setForm({ ...form, file: e.target.files?.[0] || null })}
                className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition" required />
            </div>
            <button type="submit" disabled={uploading}
              className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2">
              {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
              {uploading ? "Uploading..." : "Upload Video"}
            </button>
          </form>
        </div>
      </RequirePermission>

      {/* Previously Uploaded Videos */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Uploaded Videos</h2>
        {videos.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center text-gray-500 font-medium">No videos uploaded yet.</div>
        ) : (
          <div className="grid gap-3">
            {videos.map(v => (
              <div key={v.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-md transition">
                <div className="flex items-center gap-3">
                  <Film className="text-blue-600 w-8 h-8" />
                  <div>
                    <p className="font-bold text-gray-900">{v.title}</p>
                    <p className="text-sm text-gray-500 font-medium">{v.classGrade} • {v.subject}</p>
                  </div>
                </div>
                <a href={v.videoUrl} target="_blank" rel="noopener noreferrer"
                  className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition whitespace-nowrap text-center">
                  Watch Video
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
