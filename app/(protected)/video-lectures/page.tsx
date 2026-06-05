"use client";
import { useEffect, useState } from "react";
import { Loader2, Film } from "lucide-react";

export default function VideoLecturesPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setClasses(data.classes || []);
        setSubjects(data.subjects || []);
      });
    fetchVideos();
  }, []);

  const fetchVideos = async (classGrade?: string, subject?: string) => {
    let url = "/api/video-lectures";
    const params = new URLSearchParams();
    if (classGrade) params.append("classGrade", classGrade);
    if (subject) params.append("subject", subject);
    if (params.toString()) url += "?" + params.toString();

    const res = await fetch(url);
    const data = await res.json();
    setVideos(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchVideos(filterClass, filterSubject);
  }, [filterClass, filterSubject]);

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" size={32} /></div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
        <Film className="text-blue-600" /> Video Library
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={filterClass} onChange={e => { setFilterClass(e.target.value); setFilterSubject(""); }}
          className="bg-white border border-gray-300 rounded-xl p-2 text-sm">
          <option value="">All Classes</option>
          {classes.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
          className="bg-white border border-gray-300 rounded-xl p-2 text-sm">
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={() => { setFilterClass(""); setFilterSubject(""); }}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold">
          Clear Filters
        </button>
      </div>

      {/* Video Cards */}
      {videos.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-400">
          No video lectures available.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map(v => (
            <div key={v.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-start gap-3 mb-3">
                <Film className="text-blue-600 w-8 h-8 mt-1" />
                <div>
                  <p className="font-bold text-gray-900">{v.title}</p>
                  <p className="text-xs text-gray-500">{v.classGrade} • {v.subject}</p>
                </div>
              </div>
              {v.description && <p className="text-sm text-gray-600 mb-2 line-clamp-2">{v.description}</p>}
              <a href={v.videoUrl} target="_blank" rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition">
                Watch Now
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
