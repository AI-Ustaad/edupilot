"use client";
import { useEffect, useState } from "react";
import { Search, FileText, Video, Image as ImageIcon, ExternalLink, Loader2 } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function StudyCenter() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [filters, setFilters] = useState({ classGrade: "", subject: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Live Classes Fetch
    fetch("/api/classes")
      .then(res => res.json())
      .then(data => setClasses(data.data || []));
      
    // Subjects Fetch
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setSubjects(data.subjects || []));
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    let url = "/api/syllabus";
    if (filters.classGrade) url += `?class=${filters.classGrade}&subject=${filters.subject || ""}`;
    const res = await fetch(url);
    const data = await res.json();
    setMaterials(Array.isArray(data) ? data : (data.data || []));
    setLoading(false);
  };

  useEffect(() => {
    fetchMaterials();
  }, [filters]);

  const getIcon = (type: string) => {
    if (type === "pdf") return <FileText size={18} />;
    if (type === "video") return <Video size={18} />;
    if (type === "image") return <ImageIcon size={18} />;
    return <ExternalLink size={18} />;
  };

  return (
    <RequirePermission permissions={["videoLectures.view" as any]}>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-black text-gray-900 mb-6">Study Center</h1>
        <div className="bg-white border border-gray-200 shadow-sm p-4 mb-6 flex flex-wrap gap-4 rounded-xl">
          <select 
            value={filters.classGrade} 
            onChange={e => setFilters({ ...filters, classGrade: e.target.value })} 
            className="bg-gray-50 border border-gray-300 rounded-xl p-2 text-gray-900 flex-1 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (<option key={c.id} value={c.classGrade}>{c.classGrade}</option>))}
          </select>
          <select 
            value={filters.subject} 
            onChange={e => setFilters({ ...filters, subject: e.target.value })} 
            className="bg-gray-50 border border-gray-300 rounded-xl p-2 text-gray-900 flex-1 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
          <button onClick={() => setFilters({ classGrade: "", subject: "" })} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl transition shadow-sm">Clear Filters</button>
        </div>

        {loading && <div className="text-center py-8"><Loader2 className="animate-spin mx-auto text-blue-600" size={32} /></div>}

        {!loading && materials.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl text-center text-gray-500 py-12 font-medium">No study materials found for the selected filters.</div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map(m => (
            <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
              <div className="flex items-center gap-2 text-blue-600 mb-3 bg-blue-50 w-max px-3 py-1.5 rounded-lg border border-blue-100">
                {getIcon(m.type)} <span className="text-xs uppercase font-black tracking-widest">{m.type}</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 leading-tight">{m.title}</h3>
              <p className="text-xs text-gray-500 mb-3 font-bold uppercase tracking-wider mt-1">{m.classGrade} - {m.subject}</p>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{m.description}</p>
              <a href={m.fileUrl || m.linkUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition">View Material →</a>
            </div>
          ))}
        </div>
      </div>
    </RequirePermission>
  );
}
