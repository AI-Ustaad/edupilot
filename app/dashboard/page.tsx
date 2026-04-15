"use client";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../context/AuthContext";
import { 
  Users, BookOpen, Award, Wallet, Calendar as CalendarIcon, 
  TrendingUp, Activity, CheckSquare 
} from "lucide-react";

// Helper function to normalize strings for comparison
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
    
    // 1. Fetch Live Students
    const unsubStudents = onSnapshot(query(collection(db, "students")), (snap) => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 2. Fetch Live Classes/Sections
    const unsubSections = onSnapshot(query(collection(db, "sections")), (snap) => {
      setSections(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 3. Fetch Live Marks (For Performance & Exams Conducted)
    const unsubMarks = onSnapshot(query(collection(db, "marks")), (snap) => {
      setMarks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 4. Fetch Live Fees (If fee collection exists)
    const unsubFees = onSnapshot(query(collection(db, "fees")), (snap) => {
      setFees(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 5. Fetch Admin Settings (For Academic Year)
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

  // 1. Basic Counts
  const activeStudentsCount = students.length;
  const activeClassesCount = Array.from(new Set(sections.map(s => s.classGrade))).length;
  const totalExamsConducted = marks.length;

  // 2. Top Performers (Students with A, A+, A++ grades)
  const topPerformersCount = Array.from(new Set(
    marks.filter(m => ["A", "A+", "A++"].includes(m.grade)).map(m => m.studentId)
  )).length;

  // 3. Fee Collection (Sum of all paid fees)
  const totalFeeCollected = fees.reduce((sum, f) => sum + (Number(f.amountPaid) || 0), 0);
  const formattedFee = totalFeeCollected >= 1000 
    ? `${(totalFeeCollected / 1000).toFixed(1)}k` 
    : totalFeeCollected.toString();

  // 4. Performance Average by Term (For Line Chart)
  const termsToTrack = ["1st Term", "2nd Term", "Final Exams", "SBA"];
  const performanceData = termsToTrack.map(term => {
    const termMarks = marks.filter(m => norm(m.term) === norm(term));
    if (termMarks.length === 0) return { term, avg: 0 };
    const avg = termMarks.reduce((sum, m) => sum + Number(m.percentage || 0), 0) / termMarks.length;
    return { term, avg: Math.round(avg) };
  });

  // 5. Student Demographics by Class (For Donut Chart)
  const classDemographics: Record<string, number> = {};
  students.forEach(s => {
    const cls = s.classGrade || "Unassigned";
    classDemographics[cls] = (classDemographics[cls] || 0) + 1;
  });
  
  // Prepare SVG Donut Data
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
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Welcome back, Admin!</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Here is the live overview of your EduPilot system.</p>
        </div>
        <div className="bg-white border border-green-100 text-green-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2">
          <CalendarIcon size={16}/> Session {academicYear}
        </div>
      </div>

      {/* --- TOP KPI CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Active Students */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
           <div className="w-12 h-12 bg-[#0F172A] rounded-2xl flex items-center justify-center text-white mb-4 shadow-md">
             <Users size={24} />
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Students</p>
           <h3 className="text-4xl font-black text-[#0F172A] mt-1">{activeStudentsCount}</h3>
           <p className="text-[10px] font-bold text-[#3ac47d] mt-4 flex items-center gap-1 bg-green-50 w-fit px-2 py-1 rounded-md">
             <TrendingUp size={12}/> Live roster data
           </p>
        </div>

        {/* Card 2: Active Classes */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
           <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-md">
             <BookOpen size={24} />
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Classes</p>
           <h3 className="text-4xl font-black text-[#0F172A] mt-1">{activeClassesCount}</h3>
           <p className="text-[10px] font-bold text-blue-500 mt-4 flex items-center gap-1 bg-blue-50 w-fit px-2 py-1 rounded-md">
             <Activity size={12}/> Based on sections
           </p>
        </div>

        {/* Card 3: Top Performers */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
           <div className="w-12 h-12 bg-[#3ac47d] rounded-2xl flex items-center justify-center text-white mb-4 shadow-md">
             <Award size={24} />
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Performers</p>
           <h3 className="text-4xl font-black text-[#0F172A] mt-1">{topPerformersCount}</h3>
           <p className="text-[10px] font-bold text-[#3ac47d] mt-4 flex items-center gap-1 bg-green-50 w-fit px-2 py-1 rounded-md">
             <Award size={12}/> Grade A or above
           </p>
        </div>

        {/* Card 4: Fee Collection */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-pink-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
           <div className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-md">
             <Wallet size={24} />
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee Collection</p>
           <h3 className="text-4xl font-black text-[#0F172A] mt-1">Rs {formattedFee}</h3>
           <p className="text-[10px] font-bold text-pink-500 mt-4 flex items-center gap-1 bg-pink-50 w-fit px-2 py-1 rounded-md">
             <CheckSquare size={12}/> Updated live
           </p>
        </div>

      </div>

      {/* --- BOTTOM CHARTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. School Performance Avg (Live SVG Line Chart) */}
        <div className="bg-blue-500 rounded-3xl p-8 shadow-md text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 bg-white/20 px-4 py-2 rounded-bl-2xl">
             <p className="text-[10px] font-black uppercase tracking-widest">School Performance Avg</p>
           </div>
           
           <div className="mt-10 h-40 w-full relative">
              {/* Native SVG Line Chart */}
              <svg viewBox="0 0 400 150" className="w-full h-full overflow-visible">
                 {/* Grid Lines */}
                 <line x1="0" y1="0" x2="400" y2="0" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
                 <line x1="0" y1="75" x2="400" y2="75" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4"/>
                 <line x1="0" y1="150" x2="400" y2="150" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
                 
                 {/* Labels */}
                 <text x="-20" y="5" fill="rgba(255,255,255,0.6)" fontSize="10" fontWeight="bold">100</text>
                 <text x="-15" y="80" fill="rgba(255,255,255,0.6)" fontSize="10" fontWeight="bold">50</text>
                 <text x="-10" y="155" fill="rgba(255,255,255,0.6)" fontSize="10" fontWeight="bold">0</text>

                 {/* The Line */}
                 <polyline 
                   fill="none" 
                   stroke="#ffffff" 
                   strokeWidth="4" 
                   strokeLinecap="round" 
                   strokeLinejoin="round"
                   points={performanceData.map((d, i) => `${(i / 3) * 400},${150 - (d.avg / 100) * 150}`).join(" ")} 
                 />
                 
                 {/* The Data Points */}
                 {performanceData.map((d, i) => (
                   <g key={i}>
                     <circle cx={(i / 3) * 400} cy={150 - (d.avg / 100) * 150} r="6" fill="#3ac47d" stroke="#ffffff" strokeWidth="2"/>
                     <text x={(i / 3) * 400} y={(150 - (d.avg / 100) * 150) - 15} fill="#ffffff" fontSize="12" fontWeight="black" textAnchor="middle">{d.avg}%</text>
                   </g>
                 ))}
              </svg>
           </div>
           
           {/* X-Axis Labels */}
           <div className="flex justify-between items-center mt-4 text-[10px] font-bold text-blue-200 uppercase tracking-widest">
             {termsToTrack.map(term => <span key={term}>{term}</span>)}
           </div>
           <p className="text-xs font-medium text-blue-100 mt-6 text-center">Average percentage across all terms based on marks entry.</p>
        </div>

        {/* 2. Student Demographics (Live SVG Donut Chart) */}
        <div className="bg-[#0F172A] rounded-3xl p-8 shadow-md text-white relative flex flex-col items-center justify-center">
           <div className="absolute top-0 inset-x-0 bg-white/10 px-4 py-2 mx-auto w-fit rounded-b-2xl">
             <p className="text-[10px] font-black uppercase tracking-widest text-center">Student Demographics</p>
           </div>

           <div className="relative w-48 h-48 mt-8">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                 {/* Background Circle */}
                 <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="4"/>
                 
                 {/* Live Data Slices */}
                 {activeStudentsCount === 0 ? (
                   <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#3ac47d" strokeWidth="4" strokeDasharray="0 100"/>
                 ) : (
                   donutSlices.map((slice, i) => (
                     <circle 
                       key={i} cx="18" cy="18" r="15.915" fill="transparent" 
                       stroke={slice.color} strokeWidth="4" 
                       strokeDasharray={slice.strokeDasharray} 
                       strokeDashoffset={slice.strokeDashoffset}
                       className="transition-all duration-1000 ease-out"
                     />
                   ))
                 )}
              </svg>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-3xl font-black">{activeStudentsCount}</span>
                 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
              </div>
           </div>

           <p className="text-xs font-medium text-slate-400 mt-6 text-center">Distribution by Class Grade</p>
           
           {/* Legend */}
           <div className="flex flex-wrap justify-center gap-3 mt-4">
             {donutSlices.slice(0, 4).map((slice, i) => (
               <div key={i} className="flex items-center gap-1.5">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: slice.color }}></div>
                 <span className="text-[9px] font-bold text-slate-300">{slice.cls}</span>
               </div>
             ))}
           </div>
        </div>

        {/* 3. Total Exams Conducted */}
        <div className="bg-[#3ac47d] rounded-3xl p-8 shadow-md text-white relative flex flex-col items-center justify-center text-center">
           <div className="absolute top-0 inset-x-0 bg-white/20 px-4 py-2 mx-auto w-fit rounded-b-2xl">
             <p className="text-[10px] font-black uppercase tracking-widest">Total Exams Conducted</p>
           </div>
           
           <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mt-4 border-4 border-white/30">
             <BookOpen size={40} className="text-white" />
           </div>
           
           <h2 className="text-7xl font-black mt-6 tracking-tighter">{totalExamsConducted}</h2>
           <p className="text-sm font-bold text-green-100 mt-2">Individual mark sheets saved.</p>
           
           <div className="mt-8 bg-green-800/20 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
             <Award size={14}/> Accurate & Real-time
           </div>
        </div>

      </div>
    </div>
  );
}
