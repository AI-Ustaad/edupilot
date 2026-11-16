"use client";
import { useState, useMemo } from "react";
import { Loader2, Plus, CheckCircle } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { useClasses } from "@/hooks/useClasses";
import { formatClassLabel, cleanSectionName } from "@/lib/utils/formatClassLabel";

export default function SettingsPage() {
  const { data: settings, isLoading: isSettingsLoading } = useSettings();
  const { data: rawSections = [], isLoading: isClassesLoading } = useClasses();
  const updateMutation = useUpdateSettings();
  
  const [newClass, setNewClass] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [success, setSuccess] = useState("");

  const isLoading = isSettingsLoading && isClassesLoading;

  // Canonical Master Classes unified with /classes and Configuration Dashboard
  const classes = useMemo(() => {
    // 1. Primary: Derive from useClasses() (canonical 30 section matrix)
    if (rawSections && rawSections.length > 0) {
      const classMap = new Map<string, Set<string>>();
      rawSections.forEach((s: any) => {
        const cls = formatClassLabel(s.classGrade || s.name);
        const sec = cleanSectionName(s.sectionName || s.section || "A");
        if (cls) {
          if (!classMap.has(cls)) classMap.set(cls, new Set());
          if (sec) classMap.get(cls)!.add(sec);
        }
      });

      if (classMap.size > 0) {
        return Array.from(classMap.entries()).map(([name, secSet]) => ({
          name,
          sections: Array.from(secSet).sort(),
        })).sort((a, b) => {
          const numA = parseInt(a.name.replace(/\D/g, ""), 10) || 0;
          const numB = parseInt(b.name.replace(/\D/g, ""), 10) || 0;
          return numA - numB;
        });
      }
    }

    // 2. Secondary: Fallback to settings.classes
    if (settings?.classes && settings.classes.length > 0) {
      return settings.classes.map((c: any) => ({
        name: formatClassLabel(c.name || c.classGrade),
        sections: c.sections && Array.isArray(c.sections) && c.sections.length > 0
          ? c.sections
          : (settings.sectionNames || ["A", "B", "C"]),
      }));
    }

    // 3. Canonical 10 Classes fallback: Classes 1-10 with Sections A, B, C
    return Array.from({ length: 10 }, (_, i) => ({
      name: `Class ${i + 1}`,
      sections: ["A", "B", "C"],
    }));
  }, [rawSections, settings?.classes, settings?.sectionNames]);

  const subjects = settings?.subjects || [];

  const handleAddClass = () => {
    if (!newClass.trim()) return;
    const formatted = formatClassLabel(newClass.trim());
    updateMutation.mutate(
      { classes: [...classes, { name: formatted, sections: ["A", "B", "C"] }] },
      { onSuccess: () => { setNewClass(""); setSuccess("Settings updated!"); setTimeout(()=>setSuccess(""), 3000);} }
    );
  };

  const handleAddSubject = () => {
    if (!newSubject.trim()) return;
    updateMutation.mutate(
      { subjects: [...subjects, newSubject.trim()] },
      { onSuccess: () => { setNewSubject(""); setSuccess("Settings updated!"); setTimeout(()=>setSuccess(""), 3000);} }
    );
  };

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  const totalSections = classes.reduce((acc, c) => acc + (c.sections?.length || 0), 0);

  return (
    <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <h1 className="text-2xl font-black text-gray-900">System Configuration</h1>
        {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-2 font-bold border border-green-100"><CheckCircle size={20} /> {success}</div>}

        {/* Master Classes */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-bold text-lg text-gray-900">Master Classes</h2>
              <p className="text-xs text-gray-500 font-semibold mt-0.5">
                {classes.length} Classes • {totalSections} Sections Total
              </p>
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            <input placeholder="New class name" value={newClass} onChange={(e) => setNewClass(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-2 flex-1" />
            <button onClick={handleAddClass} className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2"><Plus size={18} /> Add</button>
          </div>
          <ul className="space-y-2">
            {classes.map((c: any) => {
              const secList = c.sections && Array.isArray(c.sections) && c.sections.length > 0
                ? c.sections
                : ["A", "B", "C"];
              return (
                <li key={c.name} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="font-semibold text-gray-900">{c.name}</span>
                  <span className="text-sm text-gray-600 font-medium">
                    {secList.length} sections: {secList.join(", ")}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Subjects */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-4 text-gray-900">Subjects</h2>
          <div className="flex gap-2 mb-4">
            <input placeholder="New subject" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-2 flex-1" />
            <button onClick={handleAddSubject} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold">Add Subject</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {subjects.map((s: string) => (
              <span key={s} className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-700">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </RequirePermission>
  );
}
