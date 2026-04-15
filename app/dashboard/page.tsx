"use client";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { 
  Users, BookOpen, Award, Wallet, Calendar as CalendarIcon, 
  TrendingUp, Activity, CheckSquare, ArrowRight, PieChart
} from "lucide-react";

// Helper function for flawless matching
const norm = (str?: string) => (str || "").trim().toLowerCase();

export default function DashboardPage() {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  
  // LIVE DATA STATES
  const [students, setStudents] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [academicYear, setAcademicYear] = useState("2026-2027");

  useEffect(() => {
    setIsMounted(true);
    const unsubStudents = onSnapshot(query(collection(db, "students")), (snap) => setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubSections = onSnapshot(query(collection(db, "sections")), (snap) => setSections(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubMarks = onSnapshot(query(collection(db, "marks")), (snap) => setMarks(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubFees = onSnapshot(query(collection(db, "fees")), (snap) => setFees(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    if (user) {
      const unsubSettings = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
        if (docSnap.exists() && docSnap.data().activeAcademicYear) {
          setAcademicYear(docSnap.data().activeAcademicYear);
        }
      });
      return () => { unsubStudents(); unsubSections(); unsubMarks(); unsubFees(); unsubSettings(); };
    }
    return () => { unsubStudents(); unsubSections(); unsubMarks(); unsubFees(); };
  }, [user]);

  if (!isMounted) return null;

  // ==========================================
  // 🧠 LIVE CALCULATIONS & METRICS ENGINE
  // ==========================================

  const activeStudentsCount = students.length;
  const activeClassesCount = Array.from(new Set(sections.map(s => s.classGrade))).length;
  
  // 🚀 BULLETPROOF BUG FIX: Ensure exact match for student + term
  const uniqueResultCards = Array.from(new Set(
    marks.map(m => `${norm(m.studentId)}_${norm(m.term)}`)
  ));
  const totalExamsConducted = uniqueResultCards.length;

  const topPerformersCount = Array.from(new Set(
    marks.filter(m => ["A", "A+", "A++"].includes(m.grade)).map(m => m.studentId)
  )).length;

  const totalFeeCollected = fees.reduce((sum, f) => sum + (Number(f.amountPaid) || 0), 0);
  const formattedFee = totalFeeCollected >= 1000 
    ? `${(totalFeeCollected / 1000).toFixed(1)}k` 
    : totalFeeCollected.toString();

  const termsToTrack = ["1st Term", "2nd Term", "Final Exams", "SBA"];
  const performanceData = termsToTrack.map(term => {
    const termMarks = marks.filter(m => norm(m.term) === norm(term));
    if (termMarks.length === 0) return { term, avg: 0 };
    const avg = termMarks.reduce((sum, m) => sum + Number(m.percentage || 0), 0) / termMarks.length;
    return { term, avg: Math.round(avg) };
  });

  const classDemographics: Record<string, number> = {};
  students.forEach(s => {
    const cls = s.classGrade || "Unassigned";
    classDemographics[cls] = (classDemographics[cls] || 0) + 1;
  });
  
  const demoColors = ["#3ac47d", "#3b82f6", "#8b5cf6", "#f43f5e", "#f59e0b"];
  let cumulativePercent = 0;
  const donutSlices = Object.entries(classDemographics).map(([cls, count], idx) => {
    const percent = activeStudentsCount > 0 ? (count / activeStudentsCount) * 100 : 0;
    const slice = {
      cls, count, percent,
      strokeDasharray: `${percent} ${100 - percent}`,
      strokeDashoffset: 100 - cumulativePercent,
      color: demoColors[idx % demoColors.length]
    };
    cumulativePercent += percent;
    return slice;
  });

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Dashboard Overview <span className="text-[#3ac47d] text-xl">(v3.0)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Interactive, real-time analytics for your institution.</p>
        </div>
        <div className="bg-white border border-green-100 text-green-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2">
          <CalendarIcon size={16}/> Session {academicYear}
        </div>
      </div>

      {/* --- MULTI-FUNCTIONAL, CLICKABLE KPI CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Students */}
        <Link href="/students" className="block relative overflow-hidden rounded-3xl p-6 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:scale-[1.03] hover:shadow-xl transition-all group">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full opacity-50 group-hover:scale-125 transition-transform duration-500"></div>
           <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white mb-4 border border-white/20">
             <Users size={24} />
           </div>
           <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Active Students</p>
           <h3 className="text-4xl font-black mt-1">{activeStudentsCount}</h3>
           <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
             <p className="text-[10px] font-bold flex items-center gap-1"><TrendingUp size={12}/> Live Roster</p>
             <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
           </div>
        </Link>

        {/* Card 2: Classes */}
        <Link href="/classes" className="block relative overflow-hidden rounded-3xl p-6 shadow-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white hover:scale-[1.03] hover:shadow-xl transition-all group">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full opacity-50 group-hover:scale-125 transition-transform duration-500"></div>
           <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white mb-4 border border-white/20">
             <BookOpen size={24} />
           </div>
           <p className="text-[10px] font-black text-purple-100 uppercase tracking-widest">Active Classes</p>
           <h3 className="text-4xl font-black mt-1">{activeClassesCount}</h3>
           <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
             <p className="text-[10px] font-bold flex items-center gap-1"><Activity size={12}/> Sections Linked</p>
             <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
           </div>
        </Link>

        {/* Card 3: Top Performers */}
        <Link href="/result" className="block relative overflow-hidden rounded-3xl p-6 shadow-lg bg-gradient-to-br from-emerald-400 to-teal-600 text-white hover:scale-[1.03] hover:shadow-xl transition-all group">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full opacity-50 group-hover:scale-125 transition-transform duration-500"></div>
           <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white mb-4 border border-white/20">
             <Award size={24} />
           </div>
           <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest">Top Performers</p>
           <h3 className="text-4xl font-black mt-1">{topPerformersCount}</h3>
           <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
             <p className="text-[10px] font-bold flex items-center gap-1"><Award size={12}/> Grade A & Above</p>
             <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
           </div>
        </Link>

        {/* Card 4: Fee Collection */}
        <Link href="/fees" className="block relative overflow-hidden rounded-3xl p-6 shadow-lg bg-gradient-to-br from-orange-400 to-rose-500 text-white hover:scale-[1.03] hover:shadow-xl transition-all group">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full opacity-50 group-hover:scale-125 transition-transform duration-500"></div>
           <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white mb-4 border border-white/20">
             <Wallet size={24} />
           </div>
           <p className="text-[10px] font-black text-orange-100 uppercase tracking-widest">Fee Collection</p>
           <h3 className="text-4xl font-black mt-1">Rs {formattedFee}</h3>
           <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
             <p className="text-[10px] font-bold flex items-center gap-1"><CheckSquare size={12}/> Live Ledger</p>
             <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
           </div>
        </Link>

      </div>

      {/* --- BOTTOM CHARTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. School Performance Avg */}
        <Link href="/marks" className="block bg-[#0F172A] hover:bg-slate-800 transition-colors rounded-3xl p-8 shadow-lg text-white relative overflow-hidden group cursor-pointer">
           <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-2 rounded-bl-2xl flex items-center gap-2">
             <Activity size={14}/>
             <p className="text-[10px] font-black uppercase tracking-widest">Performance Avg</p>
           </div>
           
           <div className="mt-10 h-40 w-full relative">
              <svg viewBox="0 0 400 150" className="w-full h-full overflow-visible">
                 <line x1="0" y1="0" x2="400" y2="0" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                 <line x1="0" y1="75" x2="400" y2="75" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4"/>
                 <line x1="0" y1="150" x2="400" y2="150" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                 
                 <text x="-20" y="5" fill="rgba(255,255,255,0.4)" fontSize="10" fontWeight="bold">100</text>
                 <text x="-15" y="80" fill="rgba(255,255,255,0.4)" fontSize="10" fontWeight="bold">50</text>
                 <text x="-10" y="155" fill="rgba(255,255,255,0.4)" fontSize="10" fontWeight="bold">0</text>

                 <polyline 
                   fill="none" 
                   stroke="#3b82f6" 
                   strokeWidth="4" 
                   strokeLinecap="round" 
                   strokeLinejoin="round"
                   className="drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                   points={performanceData.map((d, i) => `${(i / 3) * 400},${150 - (d.avg / 100) * 150}`).join(" ")} 
                 />
                 
                 {performanceData.map((d, i) => (
                   <g key={i} className="group-hover:scale-110 origin-center transition-transform cursor-crosshair">
                     <circle cx={(i / 3) * 400} cy={150 - (d.avg / 100) * 150} r="6" fill="#3b82f6" stroke="#0F172A" strokeWidth="3"/>
                     <text x={(i / 3) * 400} y={(150 - (d.avg / 100) * 150) - 15} fill="#ffffff" fontSize="12" fontWeight="black" textAnchor="middle">{d.avg}%</text>
                   </g>
                 ))}
              </svg>
           </div>
           
           <div className="flex justify-between items-center mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             {termsToTrack.map(term => <span key={term}>{term}</span>)}
           </div>
           <div className="mt-6 flex items-center justify-between border-t border-slate-700 pt-4">
             <p className="text-xs font-medium text-slate-400">Click to enter new marks.</p>
             <ArrowRight size={14} className="text-blue-500 group-hover:translate-x-1 transition-transform"/>
           </div>
        </Link>

        {/* 2. Student Demographics */}
        <Link href="/classes" className="block bg-white border border-slate-100 rounded-3xl p-8 shadow-lg relative flex flex-col items-center justify-center hover:shadow-xl transition-all group cursor-pointer">
           <div className="absolute top-0 inset-x-0 bg-slate-50 border-b border-slate-100 px-4 py-2 mx-auto w-fit rounded-b-2xl flex items-center gap-2">
             <PieChart size={14} className="text-slate-600"/>
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Demographics</p>
           </div>

           <div className="relative w-48 h-48 mt-8">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                 <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="4"/>
                 {activeStudentsCount === 0 ? (
                   <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#3ac47d" strokeWidth="4" strokeDasharray="0 100"/>
                 ) : (
                   donutSlices.map((slice, i) => (
                     <circle 
                       key={i} cx="18" cy="18" r="15.915" fill="transparent" 
                       stroke={slice.color} strokeWidth="4" 
                       strokeDasharray={slice.strokeDasharray} 
                       strokeDashoffset={slice.strokeDashoffset}
                       className="transition-all duration-1000 ease-out group-hover:stroke-[5px]"
                     />
                   ))
                 )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-3xl font-black text-[#0F172A]">{activeStudentsCount}</span>
                 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
              </div>
           </div>

           <div className="flex flex-wrap justify-center gap-3 mt-6">
             {donutSlices.slice(0, 4).map((slice, i) => (
               <div key={i} className="flex items-center gap-1.5">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: slice.color }}></div>
                 <span className="text-[9px] font-bold text-slate-600">{slice.cls}</span>
               </div>
             ))}
           </div>
           
           <div className="w-full mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
             <p className="text-xs font-medium text-slate-400">Click to view class directory.</p>
             <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 group-hover:text-blue-500 transition-all"/>
           </div>
        </Link>

        {/* 3. Total Exams Conducted */}
        <Link href="/result" className="block bg-gradient-to-br from-slate-800 to-black rounded-3xl p-8 shadow-lg text-white relative flex flex-col items-center justify-center text-center hover:scale-[1.02] transition-transform group cursor-pointer">
           <div className="absolute top-0 inset-x-0 bg-white/10 px-4 py-2 mx-auto w-fit rounded-b-2xl">
             <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Result Cards Generated</p>
           </div>
           
           <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mt-4 border border-white/10 group-hover:bg-emerald-500/20 transition-colors">
             <BookOpen size={40} className="text-emerald-400" />
           </div>
           
           <h2 className="text-7xl font-black mt-6 tracking-tighter text-white">{totalExamsConducted}</h2>
           
           <div className="mt-8 bg-white/10 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 group-hover:bg-emerald-500/30 transition-colors">
             <Award size={14} className="text-emerald-400"/> View Result Board <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform"/>
           </div>
        </Link>

      </div>
    </div>
  );
}
