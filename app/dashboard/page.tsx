"use client";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Award, Bell, ChevronDown, User, Loader2, 
  Users, Clock, ClipboardCheck, AlertTriangle, CheckCircle2 
} from "lucide-react";

const norm = (str?: string) => (str || "").trim().toLowerCase();

export default function CombinedDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [students, setStudents] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [proxies, setProxies] = useState<any[]>([]); 
  const [staffAttendance, setStaffAttendance] = useState<any[]>([]);
  const [todayStudentAttendance, setTodayStudentAttendance] = useState<any[]>([]);
  
  const [selectedClass, setSelectedClass] = useState<string>("All Classes");

  useEffect(() => {
    let mounted = true; // 👉 Fix: Memory Leak Protection
    setIsMounted(true);
    
    // 👉 Fix: Bulletproof Local Timezone Date
    const today = new Date();
    const todayStr = today.toLocaleDateString("en-CA"); // Gives YYYY-MM-DD in local time

    const unsubStudents = onSnapshot(collection(db, "students"), (snap) => {
      if(mounted) setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    const unsubMarks = onSnapshot(collection(db, "marks"), (snap) => {
      if(mounted) setMarks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    const unsubStaff = onSnapshot(collection(db, "staff"), (snap) => {
      if(mounted) setStaff(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    const unsubProxies = onSnapshot(query(collection(db, "arrangements"), where("date", "==", todayStr)), (snap) => {
      if(mounted) setProxies(snap.docs.map(d => d.data()));
    });

    const unsubStaffAtt = onSnapshot(query(collection(db, "staffAttendance"), where("date", "==", todayStr)), (snap) => {
      if(mounted) {
        setStaffAttendance(snap.docs.map(d => d.data()));
        setLoading(false); // Stop loading when core data is here
      }
    });

    // 👉 Live Student Attendance Fetching
    const unsubStudentAtt = onSnapshot(query(collection(db, "attendance"), where("date", "==", todayStr)), (snap) => {
      if(mounted) setTodayStudentAttendance(snap.docs.map(d => d.data()));
    });

    return () => { 
      mounted = false; // 👉 Fix: Cleanup prevents state updates on unmounted component
      unsubStudents(); unsubMarks(); unsubStaff(); unsubProxies(); unsubStaffAtt(); unsubStudentAtt(); 
    };
  }, []);

  if (!isMounted) return null;

  // --- LOGIC: Administration Metrics ---
  const totalStaffCount = staff.length;
  const staffPresent = staffAttendance.filter(a => a.status === "Present").length;
  const staffLeave = staffAttendance.filter(a => a.status === "Leave").length;
  const activeProxies = proxies.length;

  // --- LOGIC: Student Attendance (Real-time) ---
  const totalMarked = todayStudentAttendance.length;
  const presentCount = todayStudentAttendance.filter(a => a.status === "Present").length;
  const attendancePercentage = totalMarked === 0 ? 0 : Math.round((presentCount / totalMarked) * 100);

  // --- LOGIC: Academic Analytics ---
  const filteredStudents = selectedClass === "All Classes" 
    ? students 
    : students.filter(s => norm(s.classGrade) === norm(selectedClass));

  const studentPerformances = filteredStudents.map(student => {
    const studentMarks = marks.filter(m => m.studentId === student.id);
    let totalObtained = 0, totalMax = 0;
    studentMarks.forEach(m => { 
      totalObtained += Number(m.marksObtained || 0); 
      totalMax += Number(m.totalMarks || 0); 
    });
    const avg = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
    let status = avg >= 75 ? "mastered" : avg >= 50 ? "working" : "attention";
    return { ...student, averagePercentage: avg, status };
  });

  const masteredCount = studentPerformances.filter(s => s.status === "mastered").length;
  const workingCount = studentPerformances.filter(s => s.status === "working").length;
  const attentionCount = studentPerformances.filter(s => s.status === "attention").length;

  return (
    <div className="bg-transparent md:bg-slate-50 md:p-6 font-sans w-full overflow-x-hidden pb-20">
      {loading ? (
        <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-[#78d13b]" size={40}/></div>
      ) : (
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 p-4 sm:p-6 md:p-10 w-full animate-fade-in-up">
          
          {/* 🚀 HEADER & LOGIN CAPSULE */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="w-full flex justify-between items-center md:block">
               <h1 className="text-2xl sm:text-3xl font-black text-[#1f2937]">Command Centre</h1>
               
               {/* Mobile Profile Capsule */}
               <div className="flex md:hidden items-center gap-2 bg-slate-50 p-1.5 pr-3 rounded-full border border-slate-200">
                 <div className="w-8 h-8 bg-[#3ac47d] rounded-full flex items-center justify-center text-white"><User size={14}/></div>
                 <span className="text-[10px] font-black text-slate-700">ADMIN</span>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-600 font-bold py-3 md:py-2 px-6 rounded-xl md:rounded-full outline-none text-sm focus:border-[#3ac47d]">
                <option value="All Classes">All Classes</option>
                {Array.from(new Set(students.map(s => s.classGrade))).filter(Boolean).map(c => <option key={c as string} value={c as string}>{c as string}</option>)}
              </select>
              
              {/* Desktop Profile Capsule */}
              <div className="hidden md:flex items-center gap-3 bg-slate-50 p-1.5 pr-4 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                 <div className="w-8 h-8 bg-[#3ac47d] rounded-full flex items-center justify-center text-white"><User size={16}/></div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-800 leading-none">Principal / Admin</span>
                    <span className="text-[9px] font-bold text-slate-500">admin@edupilot.com</span>
                 </div>
              </div>
            </div>
          </div>

          {/* 🚀 TOP OPERATIONAL ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
            
            {/* Staff Tracker */}
            <div className="bg-slate-900 text-white rounded-3xl md:rounded-[2rem] p-6 shadow-lg border border-slate-800 relative overflow-hidden">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white/10 rounded-2xl"><Users size={24}/></div>
                  <span className="text-[9px] sm:text-[10px] font-bold bg-green-500/20 text-green-400 px-3 py-1 rounded-full uppercase">Staff Status</span>
               </div>
               <p className="text-3xl sm:text-4xl font-black mb-1">{staffPresent} / {totalStaffCount}</p>
               <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest">Present Today • <span className="text-red-400">{staffLeave} on Leave</span></p>
            </div>

            {/* Arrangement Tracker */}
            <div className="bg-white border-2 border-slate-100 rounded-3xl md:rounded-[2rem] p-6 shadow-sm">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl"><Clock size={24}/></div>
                  <span className="text-[9px] sm:text-[10px] font-bold bg-orange-100 text-orange-600 px-3 py-1 rounded-full uppercase">Arrangements</span>
               </div>
               <p className="text-3xl sm:text-4xl font-black text-slate-800 mb-1">{activeProxies}</p>
               <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest">Active Adjustment Periods</p>
            </div>

            {/* Real-time Student Attendance */}
            <div className="bg-white border-2 border-slate-100 rounded-3xl md:rounded-[2rem] p-6 shadow-sm sm:col-span-2 lg:col-span-1">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl"><ClipboardCheck size={24}/></div>
                  <span className="text-[9px] sm:text-[10px] font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-full uppercase">Student Attendance</span>
               </div>
               <p className="text-3xl sm:text-4xl font-black text-slate-800 mb-1">
                 {totalMarked > 0 ? `${attendancePercentage}%` : "N/A"}
               </p>
               <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest">
                 {totalMarked > 0 ? "Across all classes" : "Not marked yet"}
               </p>
            </div>
          </div>

          {/* 🚀 BOTTOM ACADEMIC SECTION */}
          <div className="border-t border-slate-100 pt-8 md:pt-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1f2937] mb-6 md:mb-8">Academic Proficiency</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
               <div className="bg-[#78d13b] rounded-3xl md:rounded-[2rem] p-6 md:p-8 text-white shadow-md relative overflow-hidden group">
                  <h3 className="text-4xl md:text-5xl font-black mb-2">{masteredCount}</h3>
                  <p className="text-xs md:text-sm font-black uppercase opacity-90">Mastered (75%+)</p>
                  <CheckCircle2 className="absolute -right-4 -bottom-4 w-24 h-24 md:w-32 md:h-32 opacity-20 group-hover:scale-110 transition-transform" />
               </div>
               <div className="bg-[#ffc122] rounded-3xl md:rounded-[2rem] p-6 md:p-8 text-[#1f2937] shadow-md relative overflow-hidden group">
                  <h3 className="text-4xl md:text-5xl font-black mb-2">{workingCount}</h3>
                  <p className="text-xs md:text-sm font-black uppercase opacity-80">Working Towards</p>
                  <Clock className="absolute -right-4 -bottom-4 w-24 h-24 md:w-32 md:h-32 opacity-20 group-hover:scale-110 transition-transform" />
               </div>
               <div className="bg-[#ff7b60] rounded-3xl md:rounded-[2rem] p-6 md:p-8 text-white shadow-md relative overflow-hidden group">
                  <h3 className="text-4xl md:text-5xl font-black mb-2">{attentionCount}</h3>
                  <p className="text-xs md:text-sm font-black uppercase opacity-90">Needs Attention</p>
                  <AlertTriangle className="absolute -right-4 -bottom-4 w-24 h-24 md:w-32 md:h-32 opacity-20 group-hover:scale-110 transition-transform" />
               </div>
            </div>

            {/* Students Performance List */}
            <div className="space-y-3">
               {studentPerformances.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 font-bold bg-slate-50 rounded-3xl text-sm">No student data found.</div>
               ) : (
                 studentPerformances.sort((a, b) => b.averagePercentage - a.averagePercentage).map((s) => (
                   <div key={s.id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 md:px-6 md:py-4 rounded-2xl md:rounded-full gap-4 ${s.status === 'mastered' ? 'bg-[#78d13b]/10' : s.status === 'working' ? 'bg-[#ffc122]/10' : 'bg-[#ff7b60]/10'} transition-all`}>
                      
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                         <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                            {s.photoBase64 ? <img src={s.photoBase64} className="w-full h-full object-cover"/> : <User size={18} className="text-slate-300"/>}
                         </div>
                         <div>
                           <p className="font-bold text-[#1f2937] text-sm truncate">{s.name}</p>
                           <p className="text-[10px] text-slate-500 font-bold uppercase">{s.classGrade} {s.section && `- ${s.section}`}</p>
                         </div>
                      </div>

                      <div className="flex flex-row items-center justify-between w-full sm:w-1/2 md:w-1/3 gap-4">
                         <div className="flex items-center gap-4 flex-1">
                            <span className="font-black text-xs w-8 text-slate-600">{s.averagePercentage}%</span>
                            <div className="flex-1 h-2.5 bg-white rounded-full overflow-hidden shadow-inner">
                               <div className={`h-full rounded-full ${s.status === 'mastered' ? 'bg-[#78d13b]' : s.status === 'working' ? 'bg-[#ffc122]' : 'bg-[#ff7b60]'}`} style={{ width: `${s.averagePercentage}%` }}></div>
                            </div>
                         </div>
                         <span className={`px-3 py-1.5 md:px-4 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase whitespace-nowrap ${s.status === 'mastered' ? 'bg-[#78d13b] text-white' : s.status === 'working' ? 'bg-[#ffc122] text-[#1f2937]' : 'bg-[#ff7b60] text-white'}`}>
                            {s.status}
                         </span>
                      </div>

                   </div>
                 ))
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
