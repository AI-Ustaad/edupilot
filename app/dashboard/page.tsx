"use client";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../context/AuthContext";
import { 
  Users, BookOpen, GraduationCap, Clock, 
  TrendingUp, Award, Calendar, Wallet 
} from "lucide-react";
// Recharts for functional, colorful graphs
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  
  // --- REAL DATA STATES ---
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [totalMarksRecords, setTotalMarksRecords] = useState(0);
  const [topPerformers, setTopPerformers] = useState(0);

  // --- CHART DATA STATES ---
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [classDistributionData, setClassDistributionData] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);

    // 1. Fetch Total Students & Class Distribution
    const unsubStudents = onSnapshot(query(collection(db, "students")), (snapshot) => {
      const studentDocs = snapshot.docs.map(d => d.data());
      setTotalStudents(studentDocs.length);
      
      // Group by Class for Pie Chart
      const classCounts: Record<string, number> = {};
      studentDocs.forEach(s => {
        const cls = s.classGrade || "Unassigned";
        classCounts[cls] = (classCounts[cls] || 0) + 1;
      });
      const pieData = Object.keys(classCounts).map(key => ({ name: key, value: classCounts[key] }));
      setClassDistributionData(pieData);

      // Estimate total active classes (unique class names)
      setTotalClasses(Object.keys(classCounts).length);
    });

    // 2. Fetch Marks Data for Performance Chart
    const unsubMarks = onSnapshot(query(collection(db, "marks")), (snapshot) => {
      const marksDocs = snapshot.docs.map(d => d.data());
      setTotalMarksRecords(marksDocs.length);

      // Calculate Top Performers (Grade A or above)
      const topCount = marksDocs.filter(m => ["A++", "A+", "A"].includes(m.grade)).length;
      setTopPerformers(topCount);

      // Group Performance by Term for Line Chart
      const termPerf: Record<string, { term: string, avgPercentage: number, count: number }> = {};
      marksDocs.forEach(m => {
        const term = m.term || "Unknown";
        if (!termPerf[term]) termPerf[term] = { term, avgPercentage: 0, count: 0 };
        termPerf[term].avgPercentage += Number(m.percentage || 0);
        termPerf[term].count += 1;
      });

      const lineData = Object.values(termPerf).map(t => ({
        name: t.term.split(" ")[0], // Simplify name (e.g., "SBA")
        average: Math.round(t.avgPercentage / t.count)
      }));
      setPerformanceData(lineData.length > 0 ? lineData : [
        { name: "Term 1", average: 65 }, { name: "Term 2", average: 75 }, { name: "Final", average: 85 } // Fallback demo
      ]);
    });

    return () => { unsubStudents(); unsubMarks(); };
  }, []);

  if (!isMounted) return null;

  // Colors for Pie Chart
  const COLORS = ['#3ac47d', '#0F172A', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      
      {/* --- TOP HEADER (White, Clean) --- */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 opacity-5"><GraduationCap size={150} /></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Welcome back, Admin!</h1>
          <p className="text-sm text-slate-500 mt-1">Here is the live overview of your EduPilot system.</p>
        </div>
        <div className="relative z-10 bg-[#f0fdf4] text-green-700 px-5 py-2.5 rounded-xl font-bold text-sm border border-green-200 flex items-center gap-2 shadow-sm">
          <Calendar size={16} /> Session 2026-2027
        </div>
      </div>

      {/* --- ROW 1: 3D FLOATING STAT CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 relative mt-4 hover:-translate-y-1 transition-transform">
          <div className="absolute -top-6 left-6 w-12 h-12 bg-[#0F172A] rounded-xl flex items-center justify-center shadow-lg text-white">
            <Users size={24} />
          </div>
          <div className="text-right mt-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Students</p>
            <p className="text-3xl font-black text-[#0F172A] mt-1">{totalStudents}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] text-green-500 font-bold flex items-center gap-1"><TrendingUp size={12}/> +12% from last month</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 relative mt-4 hover:-translate-y-1 transition-transform">
          <div className="absolute -top-6 left-6 w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg text-white">
            <BookOpen size={24} />
          </div>
          <div className="text-right mt-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Classes</p>
            <p className="text-3xl font-black text-[#0F172A] mt-1">{totalClasses}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1"><Clock size={12}/> Live roster data</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 relative mt-4 hover:-translate-y-1 transition-transform">
          <div className="absolute -top-6 left-6 w-12 h-12 bg-[#3ac47d] rounded-xl flex items-center justify-center shadow-lg text-white">
            <Award size={24} />
          </div>
          <div className="text-right mt-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Top Performers</p>
            <p className="text-3xl font-black text-[#0F172A] mt-1">{topPerformers}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] text-[#3ac47d] font-bold flex items-center gap-1"><GraduationCap size={12}/> Grade A or above</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 relative mt-4 hover:-translate-y-1 transition-transform">
          <div className="absolute -top-6 left-6 w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center shadow-lg text-white">
            <Wallet size={24} />
          </div>
          <div className="text-right mt-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fee Collection</p>
            <p className="text-3xl font-black text-[#0F172A] mt-1">Rs 240k</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] text-pink-500 font-bold flex items-center gap-1">Update pending</p>
          </div>
        </div>

      </div>

      {/* --- ROW 2: WORKING COLORFUL CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        
        {/* Chart 1: Blue Line Chart (Performance) */}
        <div className="bg-blue-500 rounded-3xl p-6 shadow-lg relative mt-4">
           <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-full shadow-md text-blue-600 font-bold text-xs uppercase tracking-widest">School Performance Avg</div>
           <div className="h-64 mt-6">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={performanceData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" vertical={false} />
                 <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" tick={{fill: 'white', fontSize: 12}} axisLine={false} tickLine={false} />
                 <YAxis stroke="rgba(255,255,255,0.7)" tick={{fill: 'white', fontSize: 12}} axisLine={false} tickLine={false} domain={[0, 100]} />
                 <RechartsTooltip contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '10px', color: 'white' }} />
                 <Line type="monotone" dataKey="average" stroke="#ffffff" strokeWidth={4} dot={{ r: 6, fill: '#3ac47d', strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 8 }} />
               </LineChart>
             </ResponsiveContainer>
           </div>
           <p className="text-white/80 text-sm font-medium mt-4">Average percentage across all terms.</p>
        </div>

        {/* Chart 2: Dark Grey Pie Chart (Demographics) */}
        <div className="bg-[#0F172A] rounded-3xl p-6 shadow-lg relative mt-4">
           <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-full shadow-md text-[#0F172A] font-bold text-xs uppercase tracking-widest">Student Demographics</div>
           <div className="h-64 mt-6">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={classDistributionData.length > 0 ? classDistributionData : [{name: 'No Data', value: 1}]} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                   {classDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                 </Pie>
                 <RechartsTooltip contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '10px', color: '#0F172A' }} />
               </PieChart>
             </ResponsiveContainer>
           </div>
           <p className="text-white/60 text-sm font-medium mt-4 text-center">Distribution by Class Grade</p>
        </div>

        {/* Chart 3: Green Bar Chart (Exams Taken) */}
        <div className="bg-[#3ac47d] rounded-3xl p-6 shadow-lg relative mt-4">
           <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-full shadow-md text-[#3ac47d] font-bold text-xs uppercase tracking-widest">Total Exams Conducted</div>
           <div className="h-64 mt-6 flex flex-col items-center justify-center text-white">
             <BookOpen size={64} className="mb-4 opacity-50" />
             <p className="text-6xl font-black">{totalMarksRecords}</p>
             <p className="text-sm font-medium opacity-80 mt-2">Individual mark sheets saved.</p>
           </div>
        </div>

      </div>

    </div>
  );
}
