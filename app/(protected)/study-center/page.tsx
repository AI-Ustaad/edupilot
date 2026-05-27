"use client";
import { useEffect, useState } from "react";
import { Search, FileText, Video, Image as ImageIcon, ExternalLink, Loader2 } from "lucide-react";

export default function StudyCenter() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [filters, setFilters] = useState({ classGrade: "", subject: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setClasses(data.classes || []);
        setSubjects(data.subjects || []);
      });
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    let url = "/api/syllabus";
    if (filters.classGrade) url += `?class=${filters.classGrade}&subject=${filters.subject || ""}`;
    const res = await fetch(url);
    const data = await res.json();
    setMaterials(Array.isArray(data) ? data : []);
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
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-black text-white mb-6">Study Center</h1>
      <div className="glass-card p-4 mb-6 flex flex-wrap gap-4">
        <select value={filters.classGrade} onChange={e => setFilters({ ...filters, classGrade: e.target.value })} className="bg-white/10 border border-white/10 rounded-xl p-2 text-white">
          <option value="">All Classes</option>
          {classes.map(c => (<option key={c}>{c}</option>))}
        </select>
        <select value={filters.subject} onChange={e => setFilters({ ...filters, subject: e.target.value })} className="bg-white/10 border border-white/10 rounded-xl p-2 text-white">
          <option value="">All Subjects</option>
          {subjects.map(s => (<option key={s}>{s}</option>))}
        </select>
        <button onClick={() => setFilters({ classGrade: "", subject: "" })} className="glass-btn">Clear Filters</button>
      </div>
      {loading && <div className="text-center"><Loader2 className="animate-spin mx-auto text-primary" size={32} /></div>}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map(m => (
          <div key={m.id} className="glass-card p-4 hover:shadow-glow transition">
            <div className="flex items-center gap-2 text-secondary mb-2">
              {getIcon(m.type)} <span className="text-xs uppercase font-bold">{m.type}</span>
            </div>
            <h3 className="font-bold text-lg text-white">{m.title}</h3>
            <p className="text-sm text-white/50 mb-2">{m.classGrade} - {m.subject}</p>
            <p className="text-sm text-white/60 line-clamp-2">{m.description}</p>
            <a href={m.fileUrl || m.linkUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-primary text-sm font-bold">View Material →</a>
          </div>
        ))}
      </div>
    </div>
  );
}
