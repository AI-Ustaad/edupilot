"use client";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Users, Layers, BookOpen, ChevronRight, ArrowLeft, 
  Search, Eye, GraduationCap
} from "lucide-react";
import Link from "next/link";

const PREDEFINED_CLASSES = ["Nursery", "Prep", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];

// 🧠 THE MAGIC FUNCTION: It ignores capital/small letters and extra spaces
const norm = (str?: string) => (str || "").trim().toLowerCase();

export default function ClassesDirectoryPage() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Data States
  const [sections, setSections] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);

  // Navigation & Search States
  const [activeView, setActiveView] = useState<"classes" | "sections" | "students">("classes");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsMounted(true);
    // Fetch Admin Defined Sections
    const unsubSections = onSnapshot(query(collection(db, "sections")), (snapshot) => {
      setSections(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    // Fetch All Students
    const unsubStudents = onSnapshot(query(collection(db, "students")), (snapshot) => {
      setAllStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubSections(); unsubStudents(); };
  }, []);

  // 🔗 SMART INTERLINKING FUNCTIONS
  const getSectionsForClass = (cls: string) => {
    // 1. Get Admin created sections
    const formalSections = sections.filter(s => norm(s.classGrade) === norm(cls));
    
    // 2. Extract sections directly from students (In case admin missed creating it)
    const studentSections = Array.from(new Set(
      allStudents.filter(s => norm(s.classGrade) === norm(cls)).map(s => s.section || "Unassigned")
    ));

    // 3. Merge both so NO student is left behind
    const merged = [...formalSections];
    studentSections.forEach(secName => {
      if (!secName || norm(secName) === "unassigned") return;
      const exists = merged.find(m => norm(m.sectionName) === norm(secName));
      if (!exists) {
         merged.push({ 
           id: `auto-${secName}`, 
           classGrade: cls, 
           sectionName: secName, 
           incharge: "Auto-Synced (Set in Admin)" // Warns admin that they need to formalize this
         });
      }
    });
    return merged;
  };

  const getStudentsForClass = (cls: string) => 
    allStudents.filter(s => norm(s.classGrade) === norm(cls));

  const getStudentsForSection = (cls: string, sec: string) => 
    allStudents.filter(s => norm(s.classGrade) === norm(cls) && norm(s.section) === norm(sec));

  // Search Logic
  const filteredStudents = allStudents.filter(s => {
    if (!searchQuery) return true;
    const queryLower = norm(searchQuery);
    return (
      norm(s.name).includes(queryLower) ||
      norm(s.rollNumber?.toString()).includes(queryLower) ||
      norm(s.section).includes(queryLower) ||
      norm(s.classGrade).includes(queryLower) ||
      norm(s.fatherName).includes(queryLower)
    );
  });

  // Only show classes that have data
  const activeClasses = PREDEFINED_CLASSES.filter(cls => 
    getSectionsForClass(cls).length > 0 || getStudentsForClass(cls).length > 0
  );

  const bgColors = ["bg-blue-500", "bg-[#3ac47d]", "bg-[#0F172A]", "bg-purple-500", "bg-orange-500", "bg-pink-500"];

  if (!isMounted) return null;

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      
      {/* HEADER & BREADCRUMBS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-3">
            <Layers className="text-[#3ac47d]"/> Academic Directory
          </h1>
          
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm w-fit">
            <button onClick={() => { setActiveView("classes"); setSelectedClass(null); setSelectedSection(null); setSearchQuery(""); }} className={`hover:text-[#3ac47d] transition-colors ${activeView === "classes" && !searchQuery ? "text-[#0F172A]" : ""}`}>
              All Classes
            </button>
            {selectedClass && !searchQuery && (
              <>
                <ChevronRight size={16} className="text-slate-300" />
                <button onClick={() => { setActiveView("sections"); setSelectedSection(null); }} className={`hover:text-[#3ac47d] transition-colors ${activeView === "sections" ? "text-[#0F172A]" : ""}`}>
                  {selectedClass}
                </button>
              </>
            )}
            {selectedSection && !searchQuery && (
              <>
                <ChevronRight size={16} className="text-slate-300" />
                <span className="text-[#3ac47d]">Section {selectedSection.sectionName}</span>
              </>
            )}
          </div>
        </div>

        {/* GLOBAL SEARCH */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, roll no, or section..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white outline-none rounded-xl pl-10 pr-4 py-3 text-sm border border-slate-200 shadow-sm focus:border-[#3ac47d] transition-colors"
          />
        </div>
      </div>

      {/* MAIN DISPLAY AREA */}
      <div className="animate-fade-in">
        
        {/* SEARCH OVERRIDE VIEW */}
        {searchQuery ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
            <div className="bg-[#3ac47d] p-6 flex justify-between items-center text-white">
              <div>
                <h2 className="text-xl font-black">Search Results</h2>
                <p className="text-xs font-medium opacity-80 mt-1">Found {filteredStudents.length} students matching "{searchQuery}"</p>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="px-6 py-4 grid grid-cols-12 gap-4 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="col-span-2">Roll No</div>
                <div className="col-span-6">Student Details</div>
                <div className="col-span-4 text-right">Action</div>
              </div>
              {filteredStudents.length === 0 ? (
                <div className="py-20 text-center text-slate-400">
                  <Search size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-bold text-sm">No students found.</p>
                </div>
              ) : (
                filteredStudents.sort((a, b) => (a.rollNumber || 0) - (b.rollNumber || 0)).map(s => (
                  <div key={s.id} className="px-6 py-4 grid grid-cols-12 gap-4 items-center bg-white hover:bg-slate-50 transition-colors">
                    <div className="col-span-2 font-black text-slate-400 text-lg">{s.rollNumber || "-"}</div>
                    <div className="col-span-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        {s.photoBase64 ? <img src={s.photoBase64} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-slate-400"><Users size={16}/></div>}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{s.classGrade} - {s.section}</p>
                      </div>
                    </div>
                    <div className="col-span-4 flex justify-end">
                      <Link href={`/student-profile?id=${s.id}`} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-100 transition-colors">
                        <Eye size={14} /> View Profile
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <>
            {/* LEVEL 1: ALL CLASSES */}
            {activeView === "classes" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {activeClasses.length === 0 ? (
                  <div className="col-span-full py-20 text-center flex flex-col items-center opacity-50 bg-white rounded-3xl border border-dashed border-slate-300">
                     <Layers size={60} className="text-slate-300 mb-4" />
                     <p className="font-bold text-slate-500">No data found in the system.</p>
                     <p className="text-xs text-slate-400 mt-1">Configure sections in Admin Panel or Admit a student.</p>
                  </div>
                ) : (
                  activeClasses.map((cls, idx) => {
                    const classSections = getSectionsForClass(cls);
                    const classStudents = getStudentsForClass(cls);
                    const colorClass = bgColors[idx % bgColors.length];

                    return (
                      <div key={cls} onClick={() => { setSelectedClass(cls); setActiveView("sections"); }} className={`bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group`}>
                        <div className="flex justify-between items-start mb-4">
                          <div className={`w-12 h-12 ${colorClass} rounded-2xl flex items-center justify-center text-white shadow-md`}><BookOpen size={24} /></div>
                          <div className="bg-slate-50 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest group-hover:bg-[#0F172A] group-hover:text-white transition-colors">Open</div>
                        </div>
                        <h3 className="text-2xl font-black text-[#0F172A] mb-1">{cls}</h3>
                        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100">
                          <span className="flex items-center justify-between text-sm font-bold text-slate-500">
                             <span className="flex items-center gap-1"><Layers size={16} className="text-blue-500"/> Sections</span>
                             <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg">{classSections.length}</span>
                          </span>
                          <span className="flex items-center justify-between text-sm font-bold text-slate-500">
                             <span className="flex items-center gap-1"><Users size={16} className="text-[#3ac47d]"/> Students</span>
                             <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-lg">{classStudents.length}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* LEVEL 2: SECTIONS */}
            {activeView === "sections" && selectedClass && (
              <div className="animate-fade-in-up">
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => { setActiveView("classes"); setSelectedClass(null); }} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 hover:bg-slate-50 text-slate-600">
                    <ArrowLeft size={18} />
                  </button>
                  <div>
                    <h2 className="text-xl font-black text-[#0F172A]">{selectedClass} Sections</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Select a section to view student roster</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getSectionsForClass(selectedClass || "").length === 0 ? (
                    <div className="col-span-full py-10 text-center text-slate-400">
                       <p className="font-bold">No students or sections found for {selectedClass}.</p>
                    </div>
                  ) : (
                    getSectionsForClass(selectedClass || "").map((section, idx) => {
                      const sectionStudents = getStudentsForSection(selectedClass || "", section.sectionName);
                      const colorClass = bgColors[idx % bgColors.length];

                      return (
                        <div key={section.id} onClick={() => { setSelectedSection(section); setActiveView("students"); }} className={`${colorClass} rounded-3xl p-6 shadow-lg relative hover:-translate-y-1 transition-transform cursor-pointer group overflow-hidden`}>
                          <div className="absolute top-6 right-6 opacity-20 group-hover:scale-110 transition-transform"><Layers size={60} /></div>
                          <div className="relative z-10 text-white">
                            <p className="text-xs font-bold text-white/70 uppercase tracking-widest">Section</p>
                            <h3 className="text-3xl font-black mt-1 uppercase">{section.sectionName}</h3>
                            <div className="mt-8 flex justify-between items-end">
                              <div>
                                <p className="text-[10px] text-white/70 uppercase font-bold tracking-wider mb-1">Total Students</p>
                                <p className="text-2xl font-bold">{sectionStudents.length}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-white/70 uppercase font-bold tracking-wider mb-1">Incharge</p>
                                <p className="text-[10px] font-bold bg-black/20 px-2 py-1 rounded-full">{section.incharge}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* LEVEL 3: ROSTER */}
            {activeView === "students" && selectedSection && (
              <div className="animate-fade-in-up bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-[#0F172A] p-6 flex items-center gap-4 text-white">
                  <button onClick={() => { setActiveView("sections"); setSelectedSection(null); }} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                    <ArrowLeft size={18} />
                  </button>
                  <div>
                    <h2 className="text-xl font-black uppercase">{selectedClass} - Section {selectedSection.sectionName}</h2>
                    <p className="text-xs font-medium opacity-80 mt-1">Incharge: {selectedSection.incharge} • Roster View</p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  <div className="px-6 py-4 grid grid-cols-12 gap-4 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="col-span-2">Roll No</div>
                    <div className="col-span-6">Student Details</div>
                    <div className="col-span-4 text-right">Action</div>
                  </div>

                  {getStudentsForSection(selectedClass || "", selectedSection.sectionName).length === 0 ? (
                    <div className="py-20 text-center text-slate-400">
                      <GraduationCap size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="font-bold text-sm">No students admitted in this section yet.</p>
                    </div>
                  ) : (
                    getStudentsForSection(selectedClass || "", selectedSection.sectionName)
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
          </>
        )}
      </div>
    </div>
  );
}
