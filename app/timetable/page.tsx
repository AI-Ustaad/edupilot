"use client";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Calendar as CalendarIcon, Users, UserCircle, Repeat, 
  Save, CheckCircle2, BookOpen, AlertCircle, Loader2, Clock
} from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = ["1st", "2nd", "3rd", "Break", "4th", "5th", "6th", "7th", "8th"];

// Helper to normalize strings
const norm = (str?: string) => (str || "").trim().toLowerCase();

export default function TimeTablePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [activeTab, setActiveTab] = useState("class"); // 'class', 'teacher', 'arrangement'

  // Data States
  const [sections, setSections] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [savedTimetables, setSavedTimetables] = useState<any[]>([]);

  // Selection States (Class-wise)
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  // Grid State: { "Monday-1st": { subject: "English", teacherId: "123", teacherName: "Ali" } }
  const [gridData, setGridData] = useState<Record<string, { subject: string, teacherId: string, teacherName: string }>>({});

  useEffect(() => {
    setIsMounted(true);
    const unsubSections = onSnapshot(query(collection(db, "sections")), (snap) => setSections(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubStaff = onSnapshot(query(collection(db, "staff")), (snap) => setStaff(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTimetables = onSnapshot(query(collection(db, "timetables")), (snap) => setSavedTimetables(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    return () => { unsubSections(); unsubStaff(); unsubTimetables(); };
  }, []);

  // 🚀 Auto-load saved timetable when class/section changes
  useEffect(() => {
    if (selectedClass && selectedSection) {
      const docId = `${norm(selectedClass)}_${norm(selectedSection)}`;
      const existing = savedTimetables.find(t => t.id === docId);
      if (existing && existing.schedule) {
        setGridData(existing.schedule);
      } else {
        setGridData({}); // Clear if no existing timetable
      }
    } else {
      setGridData({});
    }
  }, [selectedClass, selectedSection, savedTimetables]);

  const availableClasses = Array.from(new Set(sections.map(s => s.classGrade)));
  const availableSections = sections.filter(s => norm(s.classGrade) === norm(selectedClass));
  const activeSectionData = sections.find(s => norm(s.classGrade) === norm(selectedClass) && norm(s.sectionName) === norm(selectedSection));
  const availableSubjects = activeSectionData?.subjects ? [...(activeSectionData.subjects.core || []), ...(activeSectionData.subjects.electives || [])] : [];

  // Filter staff to show only Teachers
  const teachersList = staff.filter(s => {
    const designation = norm(s.professional?.designation);
    // You can adjust this filter based on your exact teacher designations
    return designation.includes("teacher") || designation.includes("s.s.e") || designation.includes("lecturer") || designation.includes("instructor") || designation.includes("sir") || designation.includes("madam");
  });
  // Fallback to all staff if filter is too strict
  const displayStaff = teachersList.length > 0 ? teachersList : staff;

  const handleCellChange = (day: string, period: string, field: "subject" | "teacherId", value: string) => {
    const key = `${day}-${period}`;
    setGridData(prev => {
      const cell = prev[key] || { subject: "", teacherId: "", teacherName: "" };
      
      let newCell = { ...cell, [field]: value };
      
      // Automatically get teacher name if ID is selected
      if (field === "teacherId") {
        const selectedTeacher = displayStaff.find(s => s.id === value);
        newCell.teacherName = selectedTeacher ? selectedTeacher.personal?.fullName : "";
      }

      return { ...prev, [key]: newCell };
    });
  };

  const handleSaveTimetable = async () => {
    if (!selectedClass || !selectedSection) return alert("Select Class and Section first.");
    setLoading(true);
    try {
      const docId = `${norm(selectedClass)}_${norm(selectedSection)}`;
      await setDoc(doc(db, "timetables", docId), {
        classGrade: selectedClass,
        section: selectedSection,
        schedule: gridData,
        updatedAt: serverTimestamp()
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert("Failed to save timetable.");
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  const TABS = [
    { id: "class", label: "Class-wise Time Table", icon: Users, desc: "Create & edit schedules for sections." },
    { id: "teacher", label: "Teacher-wise Schedule", icon: UserCircle, desc: "Auto-generated routines for staff." },
    { id: "arrangement", label: "Arrangements (Proxy)", icon: Repeat, desc: "Manage absentees & free teachers." },
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-3">
            <Clock className="text-[#3ac47d]"/> Time Table Master
          </h1>
          <p className="text-sm text-slate-500 mt-1">Smart scheduling & proxy management engine.</p>
        </div>
      </div>

      {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-100 font-bold"><CheckCircle2 size={20}/> Time Table Saved Successfully!</div>}

      {/* TABS NAVIGATION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TABS.map(tab => (
           <div 
             key={tab.id} 
             onClick={() => setActiveTab(tab.id)} 
             className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-300 ${activeTab === tab.id ? 'bg-[#0F172A] border-[#0F172A] text-white shadow-lg scale-[1.02]' : 'bg-white border-transparent hover:border-slate-200 text-slate-600 shadow-sm'}`}
           >
             <div className="flex items-center justify-between mb-2">
                <tab.icon size={24} className={activeTab === tab.id ? "text-[#3ac47d]" : "text-slate-400"} />
                {activeTab === tab.id && <span className="bg-[#3ac47d] w-2 h-2 rounded-full animate-pulse"></span>}
             </div>
             <h3 className={`font-black text-lg ${activeTab === tab.id ? 'text-white' : 'text-[#0F172A]'}`}>{tab.label}</h3>
             <p className={`text-xs mt-1 font-medium ${activeTab === tab.id ? 'text-slate-400' : 'text-slate-500'}`}>{tab.desc}</p>
           </div>
        ))}
      </div>

      {/* 🚀 TAB 1: CLASS-WISE TIME TABLE */}
      {activeTab === "class" && (
         <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
            
            {/* Filter Configuration */}
            <div className="bg-slate-50 border-b border-slate-100 p-6 flex flex-wrap lg:flex-nowrap items-end justify-between gap-4">
               <div className="flex gap-4 w-full lg:w-auto">
                 <div className="space-y-2 w-48">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Class</label>
                    <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSection(""); }} className="w-full bg-white outline-none rounded-xl px-4 py-3 text-sm border border-slate-200 font-bold text-[#0F172A] focus:border-[#3ac47d]">
                      <option value="">-- Choose --</option>
                      {availableClasses.map(cls => <option key={cls as string} value={cls as string}>{cls as string}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2 w-48">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Section</label>
                    <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} disabled={!selectedClass} className="w-full bg-white outline-none rounded-xl px-4 py-3 text-sm border border-slate-200 font-bold text-[#0F172A] disabled:opacity-50 focus:border-[#3ac47d]">
                      <option value="">-- Choose --</option>
                      {availableSections.map(sec => <option key={sec.id} value={sec.sectionName}>{sec.sectionName}</option>)}
                    </select>
                 </div>
               </div>

               <button onClick={handleSaveTimetable} disabled={!selectedClass || !selectedSection || loading} className="bg-[#3ac47d] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#2eaa6a] transition-all shadow-md disabled:opacity-50 w-full lg:w-auto justify-center">
                 {loading ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>} 
                 Save Class Schedule
               </button>
            </div>

            {/* Timetable Grid */}
            <div className="p-6 overflow-x-auto">
               {!selectedClass || !selectedSection ? (
                 <div className="py-20 flex flex-col items-center justify-center opacity-40">
                    <CalendarIcon size={60} className="mb-4 text-slate-400" />
                    <h3 className="text-xl font-black text-slate-600">Select Class & Section</h3>
                    <p className="font-medium text-sm mt-1">Configure the class above to build its weekly routine.</p>
                 </div>
               ) : (
                 <table className="w-full min-w-[800px] border-collapse">
                    <thead>
                       <tr>
                          <th className="bg-[#0F172A] text-white font-black uppercase text-xs p-4 rounded-tl-xl border border-slate-800">Period</th>
                          {DAYS.map((day, idx) => (
                             <th key={day} className={`bg-[#0F172A] text-white font-black uppercase tracking-widest text-xs p-4 border border-slate-800 ${idx === DAYS.length - 1 ? 'rounded-tr-xl' : ''}`}>
                               {day}
                             </th>
                          ))}
                       </tr>
                    </thead>
                    <tbody>
                       {PERIODS.map(period => (
                         <tr key={period} className={period === "Break" ? "bg-orange-50" : "hover:bg-slate-50 transition-colors"}>
                            
                            {/* Period Name Column */}
                            <td className="border border-slate-200 p-3 text-center bg-slate-50 font-black text-slate-600 text-sm">
                               {period}
                            </td>

                            {/* Days Columns */}
                            {DAYS.map(day => {
                               const key = `${day}-${period}`;
                               const cellData = gridData[key] || { subject: "", teacherId: "" };

                               if (period === "Break") {
                                 return (
                                   <td key={key} className="border border-orange-200 p-3 text-center">
                                      <span className="text-orange-500 font-black text-xs uppercase tracking-[0.3em]">Recess</span>
                                   </td>
                                 );
                               }

                               return (
                                 <td key={key} className="border border-slate-200 p-2 align-top">
                                    <div className="space-y-1.5">
                                       {/* Subject Select */}
                                       <select 
                                         value={cellData.subject} 
                                         onChange={e => handleCellChange(day, period, "subject", e.target.value)}
                                         className={`w-full text-xs font-bold p-1.5 rounded-md outline-none transition-colors border ${cellData.subject ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-100 border-transparent text-slate-500 hover:bg-slate-200'}`}
                                       >
                                         <option value="">Subject...</option>
                                         {availableSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                         <option value="Games">Games / PT</option>
                                         <option value="Library">Library</option>
                                         <option value="Test">Test / Revision</option>
                                       </select>
                                       
                                       {/* Teacher Select */}
                                       <select 
                                         value={cellData.teacherId} 
                                         onChange={e => handleCellChange(day, period, "teacherId", e.target.value)}
                                         className={`w-full text-[10px] font-bold p-1.5 rounded-md outline-none transition-colors border ${cellData.teacherId ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                                       >
                                         <option value="">Teacher...</option>
                                         {displayStaff.map(staff => (
                                           <option key={staff.id} value={staff.id}>
                                              {staff.personal?.fullName || "Unnamed"}
                                           </option>
                                         ))}
                                       </select>
                                    </div>
                                 </td>
                               );
                            })}
                         </tr>
                       ))}
                    </tbody>
                 </table>
               )}
            </div>
         </div>
      )}

      {/* TABS 2 & 3: PLACEHOLDERS FOR NEXT PHASES */}
      {activeTab === "teacher" && (
         <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-20 flex flex-col items-center justify-center animate-fade-in-up text-center">
            <UserCircle size={80} className="text-blue-500 mb-6 opacity-80" />
            <h2 className="text-3xl font-black text-[#0F172A] mb-2">Teacher-wise Schedule Engine</h2>
            <p className="text-slate-500 font-medium max-w-lg">
              Once you set up class timetables, this module will automatically compile and display the weekly routine for any selected teacher instantly. No manual entry needed!
            </p>
         </div>
      )}

      {activeTab === "arrangement" && (
         <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-20 flex flex-col items-center justify-center animate-fade-in-up text-center">
            <Repeat size={80} className="text-orange-500 mb-6 opacity-80" />
            <h2 className="text-3xl font-black text-[#0F172A] mb-2">Proxy & Substitution System</h2>
            <p className="text-slate-500 font-medium max-w-lg">
              Mark a teacher absent, and our smart clash-detection engine will instantly show you which teachers are free in those specific periods to assign a proxy.
            </p>
         </div>
      )}

    </div>
  );
}
