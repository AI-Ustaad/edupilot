"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { School, Plus, Trash2, Loader2, CheckCircle, Save, BookOpen, AlertCircle } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

// 🚀 نئی Layered Architecture کے Hooks Import کریں
import { useClasses, useCreateClass, useDeleteClass } from "@/hooks/classes/useClasses";

export default function ClassesManagementPage() {
  const { user } = useAuth();
  
  // 1. Fetch Classes (Hook -> Service -> API)
  const { data: sections = [], isLoading } = useClasses();
  
  // 2. Create Class Mutation
  const createMutation = useCreateClass();
  const [newClass, setNewClass] = useState("");
  const [newSection, setNewSection] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 3. Delete Class Mutation (With Optimistic Update Built-in)
  const deleteMutation = useDeleteClass();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass || !newSection) {
      setError("Class and Section name required.");
      return;
    }
    setError("");
    createMutation.mutate(
      { classGrade: newClass, sectionName: newSection },
      {
        onSuccess: () => {
          setSuccess("Section added successfully!");
          setNewClass(""); 
          setNewSection("");
          setTimeout(() => setSuccess(""), 3000);
        },
        onError: () => setError("Failed to add section."),
      }
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure? This will archive the section.")) {
      deleteMutation.mutate(id);
    }
  };

  // Group sections by class for display
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

      <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus size={20} className="text-blue-500"/> Add New Section</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="text" 
              placeholder="Class (e.g., 9, 10, 1st)" 
              value={newClass} 
              onChange={e => setNewClass(e.target.value)} 
              className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-blue-500" 
            />
            <input 
              type="text" 
              placeholder="Section (e.g., A, Blue, Morning)" 
              value={newSection} 
              onChange={e => setNewSection(e.target.value)} 
              className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-blue-500" 
            />
            <button 
              type="submit" 
              disabled={createMutation.isPending} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 py-3"
            >
              {createMutation.isPending ? <Loader2 className="animate-spin"/> : <Save size={18}/>} Save Section
            </button>
          </form>
        </div>
      </RequirePermission>

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
                    <div 
                      key={sec.id} 
                      className={`bg-gray-50 border border-gray-200 rounded-xl p-3 flex justify-between items-center hover:bg-blue-50 hover:border-blue-200 transition group ${
                        deleteMutation.isPending && deleteMutation.variables === sec.id ? 'opacity-50' : ''
                      }`}
                    >
                      <span className="font-bold text-gray-700 group-hover:text-blue-700">{sec.sectionName}</span>
                      <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
                        <button 
                          onClick={() => handleDelete(sec.id)} 
                          disabled={deleteMutation.isPending} 
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition disabled:opacity-50 p-1"
                        >
                          {deleteMutation.isPending && deleteMutation.variables === sec.id ? 
                            <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16}/>
                          }
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
