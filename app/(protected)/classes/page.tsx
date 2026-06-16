"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { School, Plus, Trash2, Loader2, AlertCircle, CheckCircle, Save, BookOpen } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

const fetchClasses = async () => {
  const res = await fetch("/api/classes");
  if (!res.ok) throw new Error("Failed to fetch classes");
  const json = await res.json();
  return json.data || [];
};

const createClassApi = async (data: any) => {
  const res = await fetch("/api/classes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error("Failed to create class");
  return res.json();
};

const deleteClassApi = async (id: string) => {
  const res = await fetch(`/api/classes?id=${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete class");
  return res.json();
};

export default function ClassesManagementPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [newClass, setNewClass] = useState("");
  const [newSection, setNewSection] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["classes", user?.tenantId],
    queryFn: fetchClasses,
    enabled: !!user?.tenantId,
  });

  const createMutation = useMutation({
    mutationFn: createClassApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      setSuccess("Section added successfully!");
      setNewClass(""); setNewSection("");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: () => setError("Failed to add section."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClassApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      setSuccess("Section archived.");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: () => setError("Failed to archive section."),
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass || !newSection) return setError("Class and Section name required.");
    setError("");
    createMutation.mutate({ classGrade: newClass, sectionName: newSection });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure? This will archive the section.")) {
      deleteMutation.mutate(id);
    }
  };

  const groupedSections = sections.reduce((acc: any, section: any) => {
    const cls = section.classGrade;
    if (!acc[cls]) acc[cls] = [];
    acc[cls].push(section);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3 border-b pb-2">
            <School className="text-blue-600"/> Classes & Sections
          </h1>
          <p className="text-sm text-gray-500 mt-2">Manage your school&apos;s academic structure.</p>
        </div>
      </div>

      {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-2 font-bold border border-green-100"><CheckCircle size={20}/> {success}</div>}
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 font-bold border border-red-100"><AlertCircle size={20}/> {error}</div>}

      {/* 🛡️ Protected Add Form */}
      <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus size={20} className="text-blue-500"/> Add New Section</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Class (e.g., 9, 10, 1st)" value={newClass} onChange={e => setNewClass(e.target.value)} className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="text" placeholder="Section (e.g., A, Blue, Morning)" value={newSection} onChange={e => setNewSection(e.target.value)} className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" disabled={createMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 py-3">
              {createMutation.isPending ? <Loader2 className="animate-spin"/> : <Save size={18}/>} Save Section
            </button>
          </form>
        </div>
      </RequirePermission>

      {/* SECTIONS LIST */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
          <BookOpen className="text-gray-600" size={20}/>
          <h2 className="font-bold text-gray-800">Active Sections</h2>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={32}/></div>
        ) : Object.keys(groupedSections).length === 0 ? (
          <div className="p-12 text-center text-gray-400 font-bold">No sections found. Add one above.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {Object.entries(groupedSections).map(([className, sectionsList]: any) => (
              <div key={className} className="p-6">
                <h3 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tight border-l-4 border-blue-600 pl-3">Class {className}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {sectionsList.map((sec: any) => (
                    <div key={sec.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex justify-between items-center hover:bg-blue-50 hover:border-blue-200 transition group">
                      <span className="font-bold text-gray-700 group-hover:text-blue-700">{sec.sectionName}</span>
                      {/* 🛡️ Protected Delete Action */}
                      <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
                        <button onClick={() => handleDelete(sec.id)} disabled={deleteMutation.isPending} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition disabled:opacity-50 p-1">
                          <Trash2 size={16}/>
                        </button>
                      </RequirePermission>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
