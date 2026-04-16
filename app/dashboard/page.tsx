"use client";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Award, Bell, ChevronDown, User, Loader2, Info } from "lucide-react";

// 🧠 THE MAGIC FUNCTION: Ignores capital/small letters
const norm = (str?: string) => (str || "").trim().toLowerCase();

export default function AnalyticsDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Real Database States
  const [students, setStudents] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  
  // UI States
  const [selectedClass, setSelectedClass] = useState<string>("All Classes");

  useEffect(() => {
    setIsMounted(true);
    
    // Fetch Real Students
    const unsubStudents = onSnapshot(query(collection(db, "students")), (snap) => {
      const studs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setStudents(studs);
      
      // Extract unique classes for the dropdown
      const uniqueClasses = Array.from(new Set(studs.map(s => s.classGrade).filter(Boolean)));
      setClasses(uniqueClasses as string[]);
    });

    // Fetch Real Marks
    const unsubMarks = onSnapshot(query(collection(db, "marks")), (snap) => {
      setMarks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => { unsubStudents(); unsubMarks(); };
  }, []);

  if (!isMounted) return null;

  // ==========================================
  // 🧠 THE ANALYTICS ENGINE (Real-time Calculations)
  // ==========================================
  
  // 1. Filter students based on selected class
  const filteredStudents = selectedClass === "All Classes" 
    ? students 
    : students.filter(s => norm(s.classGrade) === norm(selectedClass));

  // 2. Calculate Average Performance for each student
  const studentPerformances = filteredStudents.map(student => {
    // Get all marks for this specific student
    const studentMarks = marks.filter(m => m.studentId === student.id);
    
    let totalObtained = 0;
    let totalMax = 0;
    
    studentMarks.forEach(m => {
      totalObtained += Number(m.marksObtained || 0);
      totalMax += Number(m.totalMarks || 0);
    });

    const averagePercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
    
    // Categorize based on percentage
    let status = "attention"; // Red (< 50%)
    if (averagePercentage >= 75) status = "mastered"; // Green (>= 75%)
    else if (averagePercentage >= 50) status = "working"; // Yellow (50% - 74%)

    return {
      ...student,
      averagePercentage,
      totalExams: studentMarks.length,
      status
    };
  });

  // 3. Calculate Class-Wide Metrics
  const totalStudents = studentPerformances.length;
  const overallClassAvg = totalStudents > 0 
    ? Math.round(studentPerformances.reduce((acc, curr) => acc + curr.averagePercentage, 0) / totalStudents) 
    : 0;

  const masteredCount = studentPerformances.filter(s => s.status === "mastered").length;
  const workingCount = studentPerformances.filter(s => s.status === "working").length;
  const attentionCount = studentPerformances.filter(s => s.status === "attention").length;

  const masteredPct = totalStudents > 0 ? Math.round((masteredCount / totalStudents) * 100) : 0;
  const workingPct = totalStudents > 0 ? Math.round((workingCount / totalStudents) * 100) : 0;
  const attentionPct = totalStudents > 0 ? Math.round((attentionCount / totalStudents) * 100) : 0;

  // Design Colors
  const COLORS = {
    mastered: { bg: "bg-[#78d13b]", text: "text-[#78d13b]", tint: "bg-[#78d13b]/15" },
    working: { bg: "bg-[#ffc122]", text: "text-[#ffc122]", tint: "bg-[#ffc122]/15" },
    attention: { bg: "bg-[#ff7b60]", text: "text-[#ff7b60]", tint: "bg-[#ff7b60]/15" },
  };

  return (
    <div className="min-h-screen bg-slate-50 md:p-6 font-sans w-full">
      
      {loading ? (
        <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-[#78d13b]" size={40}/></div>
      ) : (
        
        // 🚀 MAIN WHITE BOARD (Extreme Rounded Corners like the image)
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-6 md:p-10 w-full animate-fade-in-up">
          
          {/* HEADER SECTION */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
            <div className="flex items-center gap-6">
              <h1 className="text-3xl font-black text-[#1f2937] tracking-tight">Dashboard</h1>
              <div className="relative">
                <select 
                  value={selectedClass} 
                  onChange={e => setSelectedClass(e.target.value)}
                  className="appearance-none bg-slate-50 border border-slate-200 text-slate-600 font-bold py-2 pl-4 pr-10 rounded-full outline-none focus:border-[#78d13b] cursor-pointer text-sm"
                >
                  <option value="All Classes">All Classes</option>
                  {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-3 text-slate-400 pointer-events-none"/>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="relative cursor-pointer bg-slate-50 p-3 rounded-full hover:bg-slate-100 transition-colors">
                  <Bell size={20} className="text-slate-600"/>
                  <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-[#ff7b60] rounded-full border-2 border-white"></span>
               </div>
            </div>
          </div>

          {/* 🚀 TOP CARDS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-12">
            
            {/* OVERALL SCORE CARD (White) */}
            <div className="lg:col-span-2 bg-white border-2 border-slate-100 rounded-[2rem] p-6 flex items-center justify-between shadow-sm">
               <div>
                  <h3 className="text-sm font-bold text-slate-500 mb-1">Overall Class Score</h3>
                  <div className="flex items-end gap-2">
                     <p className="text-5xl font-black text-[#1f2937]">{overallClassAvg}%</p>
                  </div>
                  <p className="text-xs font-bold text-slate-400 mt-4">Based on live marks data</p>
               </div>
               <div className="text-center">
                  <h3 className="text-sm font-bold text-slate-500 mb-1">Total Students</h3>
                  <p className="text-4xl font-black text-[#1f2937] mt-2">{totalStudents}</p>
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mt-2">
                     <Award className="text-[#78d13b]" size={30}/>
                  </div>
               </div>
            </div>

            {/* GREEN CARD (Mastered) */}
            <div className={`${COLORS.mastered.bg} rounded-[2rem] p-6 text-[#1f2937] flex flex-col justify-between shadow-sm relative overflow-hidden group`}>
               <h3 className="text-5xl font-black mb-2 relative z-10">{masteredCount}</h3>
               <div className="relative z-10">
                  <p className="text-sm font-black opacity-80 uppercase tracking-widest">Mastered</p>
                  <p className="text-xs font-bold mt-1 opacity-75">{masteredPct}% of class</p>
               </div>
               <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            </div>

            {/* YELLOW CARD (Working Towards) */}
            <div className={`${COLORS.working.bg} rounded-[2rem] p-6 text-[#1f2937] flex flex-col justify-between shadow-sm relative overflow-hidden group`}>
               <h3 className="text-5xl font-black mb-2 relative z-10">{workingCount}</h3>
               <div className="relative z-10">
                  <p className="text-sm font-black opacity-80 uppercase tracking-widest">Average</p>
                  <p className="text-xs font-bold mt-1 opacity-75">{workingPct}% of class</p>
               </div>
               <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            </div>

            {/* RED CARD (Needing Attention) */}
            <div className={`${COLORS.attention.bg} rounded-[2rem] p-6 text-[#1f2937] flex flex-col justify-between shadow-sm relative overflow-hidden group`}>
               <h3 className="text-5xl font-black mb-2 relative z-10 text-white">{attentionCount}</h3>
               <div className="relative z-10">
                  <p className="text-sm font-black text-white/90 uppercase tracking-widest">Alerts</p>
                  <p className="text-xs font-bold text-white/70 mt-1">{attentionPct}% of class</p>
               </div>
               <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-black/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            </div>

          </div>

          {/* 🚀 STUDENTS PROFICIENCY LIST (The Pill-shaped Rows) */}
          <div>
            <div className="flex justify-between items-center mb-6 px-2">
               <h2 className="text-xl font-black text-[#1f2937]">Students Proficiency</h2>
               <p className="text-xs font-bold text-slate-400 flex items-center gap-1"><Info size={14}/> Live Results Engine</p>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
               <div className="col-span-4 lg:col-span-3">Full Name</div>
               <div className="col-span-3 lg:col-span-2 text-center">Exams Given</div>
               <div className="col-span-5 lg:col-span-4">Average Score</div>
               <div className="hidden lg:flex col-span-3 justify-end gap-6 text-center">
                  <span className="w-16">Alert</span>
                  <span className="w-16">Average</span>
                  <span className="w-16">Mastered</span>
               </div>
            </div>

            {/* Table Rows */}
            <div className="space-y-3">
              {studentPerformances.length === 0 ? (
                 <div className="py-10 text-center text-slate-400 font-bold bg-slate-50 rounded-3xl">No student data found for this selection.</div>
              ) : (
                studentPerformances.sort((a, b) => b.averagePercentage - a.averagePercentage).map((student) => {
                  
                  // @ts-ignore (status is injected above)
                  const tintClass = COLORS[student.status].tint;
                  // @ts-ignore
                  const bgClass = COLORS[student.status].bg;

                  return (
                    <div key={student.id} className={`grid grid-cols-12 gap-4 items-center px-6 py-4 rounded-full ${tintClass} transition-all hover:scale-[1.01]`}>
                      
                      {/* Name & Avatar */}
                      <div className="col-span-4 lg:col-span-3 flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                           {student.photoBase64 ? <img src={student.photoBase64} className="w-full h-full object-cover"/> : <User size={18} className="text-slate-400"/>}
                         </div>
                         <p className="font-bold text-[#1f2937] text-sm truncate">{student.name}</p>
                      </div>

                      {/* Exams Count */}
                      <div className="col-span-3 lg:col-span-2 text-center font-black text-slate-600 text-sm">
                         {student.totalExams > 0 ? `${student.totalExams} Exams` : '-'}
                      </div>

                      {/* Progress Bar & Percentage */}
                      <div className="col-span-5 lg:col-span-4 flex items-center gap-3">
                         <div className={`px-4 py-1.5 rounded-full text-xs font-black w-16 text-center ${student.status === 'attention' ? 'text-white' : 'text-[#1f2937]'} ${bgClass}`}>
                           {student.averagePercentage}%
                         </div>
                         <div className="flex-1 h-3 bg-white rounded-full overflow-hidden shadow-inner hidden sm:block">
                            <div className={`h-full rounded-full ${bgClass}`} style={{ width: `${student.averagePercentage}%` }}></div>
                         </div>
                      </div>

                      {/* The 3 Dots (Right Aligned) */}
                      <div className="hidden lg:flex col-span-3 justify-end gap-6 items-center pr-2">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white ${student.status === 'attention' ? COLORS.attention.bg : 'bg-transparent text-transparent'}`}>
                           {student.status === 'attention' ? '!' : ''}
                         </div>
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-[#1f2937] ${student.status === 'working' ? COLORS.working.bg : 'bg-transparent text-transparent'}`}>
                           {student.status === 'working' ? '✓' : ''}
                         </div>
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-[#1f2937] ${student.status === 'mastered' ? COLORS.mastered.bg : 'bg-transparent text-transparent'}`}>
                           {student.status === 'mastered' ? '★' : ''}
                         </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
