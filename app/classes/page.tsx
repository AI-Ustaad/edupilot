"use client";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../context/AuthContext";
import { 
  Users, Layers, BookOpen, ChevronRight, ArrowLeft, 
  PlusCircle, CheckCircle2, AlertCircle, Eye
} from "lucide-react";
import Link from "next/link";

const PREDEFINED_CLASSES = ["Nursery", "Prep", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];

export default function ClassesDrillDownPage() {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  
  // Data States
  const [sections, setSections] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);

  // Form States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [newClass, setNewClass] = useState("Class 1");
  const [newSectionName, setNewSectionName] = useState("");
  const [newIncharge, setNewIncharge] = useState("");

  // Drill-Down Navigation States
  const [activeView, setActiveView] = useState<"classes" | "sections" | "students">("classes");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<any | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const unsubSections = onSnapshot(query(collection(db, "sections")), (snapshot) => {
      setSections(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubStudents = onSnapshot(query(collection(db, "students")), (snapshot) => {
      setAllStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubSections(); unsubStudents(); };
  }, []);

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return setErrorMsg("Section name required.");
    setLoading(true); setErrorMsg(""); setSuccess(false);
    
    const sectionId = `${newClass}-${newSectionName}`.replace(/\s+/g, '-');
    try {
      await setDoc(doc(db, "sections", sectionId), {
        classGrade: newClass,
        sectionName: newSectionName,
        incharge: newIncharge || "Unassigned",
        createdAt: serverTimestamp()
      });
      setSuccess(true); setNewSectionName(""); setNewIncharge("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setErrorMsg("Failed to create section.");
    } finally {
      setLoading(false);
    }
  };

  // Helper Functions for Data Counting
  const getSectionsForClass = (cls: string) => sections.filter(s => s.classGrade === cls);
  const getStudentsForClass = (cls: string) => allStudents.filter(s => s.classGrade === cls);
  const getStudentsForSection = (cls: string, sec: string) => allStudents.filter(s => s.classGrade === cls && s.section === sec);

  // Active Classes (Only show classes that have at least one section created)
  const activeClasses = PREDEFINED_CLASSES.filter(cls => getSectionsForClass(cls).length > 0);
  const bgColors = ["bg-blue-500", "bg-[#3ac47d]", "bg-[#0F172A]", "bg-purple-500", "bg-orange-500", "bg-pink-500"];

  if (!isMounted) return null;

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      
      {/* --- HEADER & BREADCRUMBS --- */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Academic Structure</h1>
        
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm w-fit">
          <button onClick={() => { setActiveView("classes"); setSelectedClass(null); setSelectedSection(null); }} className={`hover:text-[#3ac47d] transition-colors ${activeView === "classes" ? "text-[#0F172A]" : ""}`}>
            All Classes
          </button>
          
          {selectedClass && (
            <>
              <ChevronRight size={16} className="text-slate-300" />
              <button onClick={() => { setActiveView("sections"); setSelectedSection(null); }} className={`hover:text-[#3ac47d] transition-colors ${activeView === "sections" ? "text-[#0F172A]" : ""}`}>
                {selectedClass}
              </button>
            </>
          )}

          {selectedSection && (
            <>
              <ChevronRight size={16} className="text-slate-300" />
              <span className="text-[#3ac47d]">Section {selectedSection.sectionName}</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT COLUMN: ALWAYS SHOW CREATE FORM --- */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-6">
            <h2 className="text-sm font-bold text-[#3ac47d] uppercase tracking-widest mb-6 flex items-center gap-2">
              <PlusCircle size={18}/> Create New Section
            </h2>

            {success && <div className="bg-green-50 text-green-700 p-3 rounded-xl mb-4 text-xs font-bold border border-green-100 flex items-center gap-2"><CheckCircle2 size={16}/> Section created!</div>}
            {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-xs font-bold border border-red-100 flex items-center gap-2"><AlertCircle size={16}/> {errorMsg}</div>}

            <form onSubmit={handleCreateSection} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Select Base Class</label>
                <select value={newClass} onChange={(e) => setNewClass(e.target.value)} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border font-bold text-[#0F172A] cursor-pointer">
                  {PREDEFINED_CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Section Name</label>
                <input required value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} placeholder="e.g. Jinnah, Blue" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Class Incharge / Teacher</label>
                <input value={newIncharge} onChange={(e) => setNewIncharge(e.target.value)} placeholder="e.g. Sir Ali" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border font-medium" />
              </div>
              <button disabled={loading} type="submit" className="w-full bg-[#0F172A] text-white py-3 rounded-xl font-bold mt-4 hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50">
                {loading ? "Creating..." : "Save Section"}
              </button>
            </form>
          </div>
        </div>

        {/* --- RIGHT COLUMN: DYNAMIC DRILL-DOWN VIEWS --- */}
        <div className="lg:col-span-8 animate-fade-in">
          
          {/* VIEW 1: ALL CLASSES */}
          {activeView === "classes" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {activeClasses.length === 0 ? (
                <div className="col-span-full py-20 text-center flex flex-col items-center opacity-50 bg-white rounded-3xl border border-dashed border-slate-300">
                   <Layers size={60} className="text-slate-300 mb-4" />
                   <p className="font-bold text-slate-500">No classes configured yet.</p>
                   <p className="text-xs text-slate-400 mt-1">Create a section on the left to get started.</p>
                </div>
              ) : (
                activeClasses.map((cls, idx) => {
                  const classSections = getSectionsForClass(cls);
                  const classStudents = getStudentsForClass(cls);
                  const colorClass = bgColors[idx % bgColors.length];

                  return (
                    <div 
                      key={cls} 
                      onClick={() => { setSelectedClass(cls); setActiveView("sections"); }}
                      className={`bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 ${colorClass} rounded-2xl flex items-center justify-center text-white shadow-sm`}>
                          <BookOpen size={24} />
                        </div>
                        <div className="bg-slate-50 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest group-hover:bg-[#0F172A] group-hover:text-white transition-colors">
                          View Details
                        </div>
                      </div>
                      <h3 className="text-2xl font-black text-[#0F172A] mb-1">{cls}</h3>
                      <div className="flex items-center gap-4 text-sm font-bold text-slate-500 mt-4 pt-4 border-t border-slate-100">
                        <span className="flex items-center gap-1"><Layers size={16} className="text-blue-500"/> {classSections.length} Sections</span>
                        <span className="flex items-center gap-1"><Users size={16} className="text-[#3ac47d]"/> {classStudents.length} Students</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* VIEW 2: SECTIONS INSIDE A CLASS */}
          {activeView === "sections" && selectedClass && (
            <div className="animate-fade-in-up">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => { setActiveView("classes"); setSelectedClass(null); }} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 hover:bg-slate-50 text-slate-600">
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h2 className="text-xl font-black text-[#0F172A]">{selectedClass} Sections</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Select a section to view students</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {getSectionsForClass(selectedClass).map((section, idx) => {
                  const sectionStudents = getStudentsForSection(selectedClass, section.sectionName);
                  const colorClass = bgColors[idx % bgColors.length];

                  return (
                    <div 
                      key={section.id} 
                      onClick={() => { setSelectedSection(section); setActiveView("students"); }}
                      className={`${colorClass} rounded-3xl p-6 shadow-lg relative hover:-translate-y-1 transition-transform cursor-pointer group overflow-hidden`}
                    >
                      <div className="absolute top-6 right-6 opacity-20 group-hover:scale-110 transition-transform"><Layers size={60} /></div>
                      <div className="relative z-10 text-white">
                        <p className="text-xs font-bold text-white/70 uppercase tracking-widest">Section</p>
                        <h3 className="text-3xl font-black mt-1">{section.sectionName}</h3>
                        
                        <div className="mt-8 flex justify-between items-end">
                          <div>
                            <p className="text-[10px] text-white/70 uppercase font-bold tracking-wider mb-1">Total Students</p>
                            <p className="text-2xl font-bold">{sectionStudents.length}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-white/70 uppercase font-bold tracking-wider mb-1">Incharge</p>
                            <p className="text-sm font-bold bg-black/20 px-3 py-1 rounded-full">{section.incharge}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 3: STUDENTS ROSTER (Final Drill-down) */}
          {activeView === "students" && selectedSection && (
            <div className="animate-fade-in-up bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-[#0F172A] p-6 flex items-center gap-4 text-white">
                <button onClick={() => { setActiveView("sections"); setSelectedSection(null); }} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h2 className="text-xl font-black">{selectedClass} - Section {selectedSection.sectionName}</h2>
                  <p className="text-xs font-medium opacity-80 mt-1">Incharge: {selectedSection.incharge} • Roster View</p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                <div className="px-6 py-4 grid grid-cols-12 gap-4 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="col-span-2">Roll No</div>
                  <div className="col-span-6">Student Details</div>
                  <div className="col-span-4 text-right">Action</div>
                </div>

                {getStudentsForSection(selectedClass, selectedSection.sectionName).length === 0 ? (
                  <div className="py-20 text-center text-slate-400">
                    <Users size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-bold text-sm">No students in this section.</p>
                  </div>
                ) : (
                  getStudentsForSection(selectedClass, selectedSection.sectionName)
                  .sort((a, b) => (a.rollNumber || 0) - (b.rollNumber || 0))
                  .map(s => (
                    <div key={s.id} className="px-6 py-4 grid grid-cols-12 gap-4 items-center bg-white hover:bg-slate-50 transition-colors">
                      <div className="col-span-2 font-black text-slate-400 text-lg">{s.rollNumber || "-"}</div>
                      <div className="col-span-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                          {s.photoBase64 ? <img src={s.photoBase64} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-slate-400"><Users size={16}/></div>}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{s.fatherName}</p>
                        </div>
                      </div>
                      <div className="col-span-4 flex justify-end">
                        {/* Link to the magical AI Profile Page */}
                        <Link href={`/student-profile?id=${s.id}`} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-100 transition-colors">
                          <Eye size={14} /> View Profile
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
