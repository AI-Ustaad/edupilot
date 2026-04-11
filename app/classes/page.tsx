"use client";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, setDoc, doc, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../context/AuthContext";
import { Users, PlusCircle, CheckCircle2, AlertCircle, X, BookOpen, GraduationCap } from "lucide-react";

// The 12 pre-defined fixed classes
const PREDEFINED_CLASSES = ["Nursery", "Prep", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];

export default function ClassesPage() {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // States for fetching data
  const [sections, setSections] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);

  // State for creating new section
  const [newClass, setNewClass] = useState("Class 1");
  const [newSectionName, setNewSectionName] = useState("");
  const [newIncharge, setNewIncharge] = useState("");

  // Modal State
  const [selectedSectionModal, setSelectedSectionModal] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    
    // Fetch Sections
    const unsubSections = onSnapshot(query(collection(db, "sections")), (snapshot) => {
      setSections(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Fetch All Students (to auto-calculate capacities and show rosters)
    const unsubStudents = onSnapshot(query(collection(db, "students")), (snapshot) => {
      setAllStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubSections(); unsubStudents(); };
  }, []);

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return setErrorMsg("Section name is required.");
    
    setLoading(true); setErrorMsg(""); setSuccess(false);
    
    // Create a unique ID like "Class-9-Jinnah"
    const sectionId = `${newClass}-${newSectionName}`.replace(/\s+/g, '-');

    try {
      await setDoc(doc(db, "sections", sectionId), {
        classGrade: newClass,
        sectionName: newSectionName,
        incharge: newIncharge || "Unassigned",
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setNewSectionName(""); setNewIncharge("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setErrorMsg("Failed to create section.");
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  // Background colors array to make cards vibrant
  const bgColors = ["bg-blue-500", "bg-[#3ac47d]", "bg-[#0F172A]", "bg-purple-500", "bg-orange-500", "bg-pink-500"];

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Classes & Sections</h1>
          <p className="text-sm text-slate-500 mt-1">Manage school structure, sections, and class rosters.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT COLUMN: CREATE SECTION FORM --- */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 sticky top-6">
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
                <input required value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} placeholder="e.g. Jinnah, Blue, A" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border font-bold" />
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

        {/* --- RIGHT COLUMN: SMART CLASS GRID --- */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {sections.length === 0 ? (
              <div className="col-span-full py-20 text-center flex flex-col items-center opacity-50">
                 <BookOpen size={60} className="text-slate-300 mb-4" />
                 <p className="font-bold text-slate-500">No sections created yet.</p>
              </div>
            ) : (
              sections.map((section, index) => {
                // The Auto-Filtering Magic: Count students matching this class AND section
                const classStudents = allStudents.filter(s => s.classGrade === section.classGrade && s.section === section.sectionName);
                const colorClass = bgColors[index % bgColors.length]; // cycle colors
                
                return (
                  <div 
                    key={section.id} 
                    onClick={() => setSelectedSectionModal({ ...section, students: classStudents, colorClass })}
                    className={`${colorClass} rounded-3xl p-6 shadow-lg relative hover:-translate-y-1 transition-transform cursor-pointer group`}
                  >
                    <div className="absolute top-6 right-6 opacity-20 group-hover:scale-110 transition-transform"><Users size={60} /></div>
                    <div className="relative z-10">
                      <p className="text-xs font-bold text-white/70 uppercase tracking-widest">{section.classGrade}</p>
                      <h3 className="text-3xl font-black text-white mt-1">Sec: {section.sectionName}</h3>
                      
                      <div className="mt-8 flex justify-between items-end">
                        <div>
                          <p className="text-[10px] text-white/70 uppercase font-bold tracking-wider mb-1">Total Students</p>
                          <p className="text-2xl font-bold text-white">{classStudents.length}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-white/70 uppercase font-bold tracking-wider mb-1">Incharge</p>
                          <p className="text-sm font-bold text-white bg-black/20 px-3 py-1 rounded-full">{section.incharge}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

          </div>
        </div>
      </div>

      {/* --- MODAL: CLASS ROSTER (POPUP) --- */}
      {selectedSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in-down flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className={`${selectedSectionModal.colorClass} p-6 flex justify-between items-start text-white shrink-0`}>
              <div>
                <p className="text-xs font-bold text-white/70 uppercase tracking-widest">Class Roster</p>
                <h2 className="text-2xl font-black mt-1">{selectedSectionModal.classGrade} - {selectedSectionModal.sectionName}</h2>
                <p className="text-sm font-medium mt-1 opacity-90"><span className="font-bold">Incharge:</span> {selectedSectionModal.incharge} • {selectedSectionModal.students.length} Students</p>
              </div>
              <button onClick={() => setSelectedSectionModal(null)} className="bg-black/20 hover:bg-black/40 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body (Student List) */}
            <div className="p-0 overflow-y-auto flex-1 bg-slate-50">
              {selectedSectionModal.students.length === 0 ? (
                 <div className="py-20 text-center text-slate-400">
                   <GraduationCap size={40} className="mx-auto mb-3 opacity-30" />
                   <p className="font-medium text-sm">No students admitted in this section yet.</p>
                 </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  <div className="px-6 py-3 grid grid-cols-12 gap-4 bg-white border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest sticky top-0">
                    <div className="col-span-2">Roll No</div>
                    <div className="col-span-6">Student Name</div>
                    <div className="col-span-4 text-right">Status</div>
                  </div>
                  {selectedSectionModal.students.sort((a:any, b:any) => (a.rollNumber || 0) - (b.rollNumber || 0)).map((s:any) => (
                    <div key={s.id} className="px-6 py-4 grid grid-cols-12 gap-4 items-center bg-white hover:bg-slate-50 transition-colors">
                      <div className="col-span-2 font-black text-slate-400">{s.rollNumber || "-"}</div>
                      <div className="col-span-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                          {s.photoBase64 ? <img src={s.photoBase64} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-slate-400"><Users size={12}/></div>}
                        </div>
                        <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                      </div>
                      <div className="col-span-4 flex justify-end">
                         <span className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
