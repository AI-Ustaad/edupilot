"use client";
import { useState } from "react";
import { Loader2, Plus, CheckCircle } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();
  
  const [newClass, setNewClass] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [success, setSuccess] = useState("");

  const classes = settings?.classes || [];
  const subjects = settings?.subjects || [];

  const handleAddClass = () => {
    if (!newClass.trim()) return;
    updateMutation.mutate(
      { classes: [...classes, { name: newClass.trim(), sections: [] }] },
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

  return (
    <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <h1 className="text-2xl font-black text-gray-900">System Configuration</h1>
        {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-2 font-bold border border-green-100"><CheckCircle size={20} /> {success}</div>}

        {/* Master Classes */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-4">Master Classes</h2>
          <div className="flex gap-2 mb-4">
            <input placeholder="New class name" value={newClass} onChange={(e) => setNewClass(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-2 flex-1" />
            <button onClick={handleAddClass} className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2"><Plus size={18} /> Add</button>
          </div>
          <ul className="space-y-2">
            {classes.map((c: any) => (
              <li key={c.name} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                <span className="font-medium">{c.name}</span>
                <span className="text-sm text-gray-500">{c.sections?.length || 0} sections</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Subjects */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-4">Subjects</h2>
          <div className="flex gap-2 mb-4">
            <input placeholder="New subject" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-2 flex-1" />
            <button onClick={handleAddSubject} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold">Add Subject</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {subjects.map((s: string) => (
              <span key={s} className="bg-gray-100 px-3 py-1 rounded-full text-sm">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </RequirePermission>
  );
}
