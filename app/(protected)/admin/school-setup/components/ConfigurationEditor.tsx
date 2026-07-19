// app/(protected)/admin/school-setup/components/ConfigurationEditor.tsx
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { SchoolConfigurationViewModel } from "@/types/viewmodels/school-configuration.viewmodel";
import type { SchoolConfigurationInput } from "@/types/school-configuration";

export function ConfigurationEditor({ 
  initialData, 
  onSave, 
  isSaving 
}: { 
  initialData: SchoolConfigurationViewModel | null; 
  onSave: (input: SchoolConfigurationInput) => void; 
  isSaving: boolean; 
}) {
  const [schoolName, setSchoolName] = useState(initialData?.schoolName || "");
  const [schoolType, setSchoolType] = useState(initialData?.schoolType || "Private");
  const [sections, setSections] = useState((initialData?.sectionNames || ["A"]).join(", "));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      schoolName,
      schoolType: schoolType as any,
      curriculumId: "federal", // Default for now, UI can be expanded later
      levels: ["primary"], // Default for now
      sectionNames: sections.split(",").map(s => s.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border shadow-sm rounded-2xl p-6 space-y-6">
      <div className="grid md:grid-cols-2 gap-5">
        <label className="block text-sm font-bold text-slate-700">
          School Name
          <input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="w-full mt-1 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500" required />
        </label>
        <label className="block text-sm font-bold text-slate-700">
          School Type
          <select value={schoolType} onChange={(e) => setSchoolType(e.target.value)} className="w-full mt-1 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
            <option>Private</option>
            <option>Government</option>
            <option>Madrissa</option>
          </select>
        </label>
        <label className="block text-sm font-bold text-slate-700 md:col-span-2">
          Default Sections
          <input value={sections} onChange={(e) => setSections(e.target.value)} className="w-full mt-1 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
        </label>
      </div>
      
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button type="submit" disabled={isSaving || !schoolName} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50 flex items-center gap-2">
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
          Save & Publish Configuration
        </button>
      </div>
    </form>
  );
}
