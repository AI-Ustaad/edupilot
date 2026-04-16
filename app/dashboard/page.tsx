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
  const [proxies, setProxies] = useState<any[]>([]); // Adjustments
  const [staffAttendance, setStaffAttendance] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("All Classes");

  useEffect(() => {
    setIsMounted(true);
    const todayStr = new Date().toISOString().split('T')[0];

    // Real-time Listeners
    const unsubStudents = onSnapshot(collection(db, "students"), (snap) => setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubMarks = onSnapshot(collection(db, "marks"), (snap) => setMarks(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubStaff = onSnapshot(collection(db, "staff"), (snap) => setStaff(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    // Proxies/Adjustments for Today
    const unsubProxies = onSnapshot(query(collection(db, "arrangements"), where("date", "==", todayStr)), (snap) => {
      setProxies(snap.docs.map(d => d.data()));
    });

    // Staff Attendance for Today
    const unsubStaffAtt = onSnapshot(query(collection(db, "staffAttendance"), where("date", "==", todayStr)), (snap) => {
      setStaffAttendance(snap.docs.map(d => d.data()));
      setLoading(false);
    });

    return () => { unsubStudents(); unsubMarks(); unsubStaff(); unsubProxies(); unsubStaffAtt(); };
  }, []);

  if (!isMounted) return null;

  // --- LOGIC: Administration Metrics ---
  const totalStaffCount = staff.length;
  const staffPresent = staffAttendance.filter(a => a.status === "Present").length;
  const staffLeave = staffAttendance.filter(a => a.status === "Leave").length;
  const activeProxies = proxies.length;

  // --- LOGIC: Academic Analytics ---
  const filteredStudents = selectedClass === "All Classes" 
    ? students 
    : students.filter(s => norm(s.classGrade) === norm(selectedClass));

  const studentPerformances = filteredStudents.map(student => {
    const studentMarks = marks.filter(m => m.studentId === student.id);
    let totalObtained = 0, totalMax = 0;
    studentMarks.forEach(m => { totalObtained += Number(m.marksObtained || 0); totalMax += Number(m.totalMarks || 0); });
    const avg = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
    let status = avg >= 75 ? "mastered" : avg >= 50 ? "working" : "attention";
    return { ...student, averagePercentage: avg, status };
  });

  const masteredCount = studentPerformances.filter(s => s.status === "mastered").length;
  const workingCount = studentPerformances.filter(s => s.status === "working").length;
  const attentionCount = studentPerformances.filter(s => s.status === "attention").length;

  return (
    <div className="min-h-screen bg-slate-50 md:p-6 font-sans w-full">
      {loading ? (
        <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-[#78d13b]" size={40}/></div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-6 md:p-10 w-full animate-fade-in-up">
          
          {/* HEADER */}
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-black text-[#1f2937]">Command Centre</h1>
            <div className="flex gap-4">
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-600 font-bold py-2 px-6 rounded-full outline-none text-sm">
                <option value="All Classes">All Classes</option>
                {Array.from(new Set(students.map(s => s.classGrade))).map(c => <option key={c as string} value={c as string}>{c as string}</option>)}
              </select>
            </div>
          </div>

          {/* 🚀 TOP OPERATIONAL ROW (Administration) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            
            {/* Staff Tracker */}
            <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-lg border border-slate-800">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white/10 rounded-2xl"><Users size={24}/></div>
                  <span className="text-[10px] font-bold bg-green-500/20 text-green-400 px-3 py-1 rounded-full uppercase">Staff Status</span>
               </div>
               <p className="text-4xl font-black mb-1">{staffPresent} / {totalStaffCount}</p>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Present Today • <span className="text-red-400">{staffLeave} on Leave</span></p>
            </div>

            {/* Arrangement Tracker */}
            <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-6 shadow-sm">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl"><Clock size={24}/></div>
                  <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-3 py-1 rounded-full uppercase">Arrangements</span>
               </div>
               <p className="text-4xl font-black text-slate-800 mb-1">{activeProxies}</p>
               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Active Adjustment Periods</p>
            </div>

            {/* Daily Attendance Summary */}
            <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-6 shadow-sm">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl"><ClipboardCheck size={24}/></div>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-full uppercase">Student Attendance</span>
               </div>
               <p className="text-4xl font-black text-slate-800 mb-1">92%</p>
               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Across all classes</p>
            </div>
          </div>

          {/* 🚀 BOTTOM ACADEMIC SECTION (The EdTech Design) */}
          <div className="border-t border-slate-100 pt-12">
            <h2 className="text-2xl font-black text-[#1f2937] mb-8">Academic Proficiency</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
               <div className="bg-[#78d13b] rounded-[2rem] p-8 text-white shadow-md relative overflow-hidden group">
                  <h3 className="text-5xl font-black mb-2">{masteredCount}</h3>
                  <p className="text-sm font-black uppercase opacity-90">Mastered (75%+)</p>
                  <CheckCircle2 className="absolute -right-4 -bottom-4 w-32 h-32 opacity-20 group-hover:scale-110 transition-transform" />
               </div>
               <div className="bg-[#ffc122] rounded-[2rem] p-8 text-[#1f2937] shadow-md relative overflow-hidden group">
                  <h3 className="text-5xl font-black mb-2">{workingCount}</h3>
                  <p className="text-sm font-black uppercase opacity-80">Working Towards</p>
                  <Clock className="absolute -right-4 -bottom-4 w-32 h-32 opacity-20 group-hover:scale-110 transition-transform" />
               </div>
               <div className="bg-[#ff7b60] rounded-[2rem] p-8 text-white shadow-md relative overflow-hidden group">
                  <h3 className="text-5xl font-black mb-2">{attentionCount}</h3>
                  <p className="text-sm font-black uppercase opacity-90">Needs Attention</p>
                  <AlertTriangle className="absolute -right-4 -bottom-4 w-32 h-32 opacity-20 group-hover:scale-110 transition-transform" />
               </div>
            </div>

            {/* Students Table */}
            <div className="space-y-3">
               {studentPerformances.map((s) => (
                 <div key={s.id} className={`grid grid-cols-12 gap-4 items-center px-6 py-4 rounded-full ${s.status === 'mastered' ? 'bg-[#78d13b]/10' : s.status === 'working' ? 'bg-[#ffc122]/10' : 'bg-[#ff7b60]/10'} transition-all`}>
                    <div className="col-span-4 flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                          {s.photoBase64 ? <img src={s.photoBase64} className="w-full h-full object-cover"/> : <User size={18} className="text-slate-300"/>}
                       </div>
                       <p className="font-bold text-[#1f2937] text-sm">{s.name}</p>
                    </div>
                    <div className="col-span-5 flex items-center gap-4">
                       <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${s.status === 'mastered' ? 'bg-[#78d13b]' : s.status === 'working' ? 'bg-[#ffc122]' : 'bg-[#ff7b60]'}`} style={{ width: `${s.averagePercentage}%` }}></div>
                       </div>
                       <span className="font-black text-xs w-10 text-slate-600">{s.averagePercentage}%</span>
                    </div>
                    <div className="col-span-3 text-right">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${s.status === 'mastered' ? 'bg-[#78d13b] text-white' : s.status === 'working' ? 'bg-[#ffc122] text-[#1f2937]' : 'bg-[#ff7b60] text-white'}`}>
                          {s.status}
                       </span>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
