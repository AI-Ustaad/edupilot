"use client";
import { useState } from "react";
import { Loader2, BookOpen, FileText, Video, ExternalLink } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { useClasses } from "@/hooks/useClasses";
import { useSettings } from "@/hooks/useSettings";
import { useSyllabus } from "@/hooks/useSyllabus";

export default function StudentSyllabusPage() {
  const [filterClass, setFilterClass] = useState("");

  const { data: classesData = [] } = useClasses();
  const { data: settings } = useSettings();
  const subjects = settings?.subjects || [];

  const { data: materials = [], isLoading } = useSyllabus(filterClass);

  const getIcon = (type: string) => {
    if (type === "pdf") return <FileText size={18} />;
    if (type === "video") return <Video size={18} />;
    return <ExternalLink size={18} />;
  };

  return (
    <RequirePermission permissions={["videoLectures.view" as any]}>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2"><BookOpen className="text-blue-600" /> Course Syllabus</h1>
        
        <div className="bg-white border border-gray-200 shadow-sm p-4 mb-6 flex flex-wrap gap-4 rounded-xl">
          <select 
            value={filterClass} 
            onChange={e => setFilterClass(e.target.value)} 
            className="bg-gray-50 border border-gray-300 rounded-xl p-2 text-gray-900 flex-1 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Classes</option>
            {classesData.map((c: any) => (<option key={c.id} value={c.classGrade}>{c.classGrade}</option>))}
          </select>
        </div>

        {isLoading && <div className="text-center py-8"><Loader2 className="animate-spin mx-auto text-blue-600" size={32} /></div>}

        {!isLoading && materials.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl text-center text-gray-500 py-12 font-medium">No syllabus materials found.</div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((m: any) => (
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
