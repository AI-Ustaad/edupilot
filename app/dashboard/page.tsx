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
    
    const unsubStudents = onSnapshot(query(collection(db, "students")), (snap) => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubSections = onSnapshot(query(collection(db, "sections")), (snap) => {
      setSections(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubMarks = onSnapshot(query(collection(db, "marks")), (snap) => {
      setMarks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubFees = onSnapshot(query(collection(db, "fees")), (snap) => {
      setFees(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

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
  
  // 🚀 BUG FIX: Count unique combinations of (Student ID + Term) instead of total subjects
  const totalExamsConducted = Array.from(new Set(
    marks.map(m => `${m.studentId}_${m.term}`)
  )).length;

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
           <div className="w-12 h-12 bg-blue-500 rounded-2xl flex
