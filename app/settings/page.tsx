"use client";
import React, { useState, useEffect } from "react";
import { collection, doc, setDoc, onSnapshot, serverTimestamp, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Building2, Layers, Wallet, ShieldCheck, Clock, Save, 
  CheckCircle2, Loader2, CalendarRange, AlertCircle, Trash2
} from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const norm = (str?: string) => (str || "").trim().toLowerCase();

const getOrdinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("allotment"); // Default to allotment for testing
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [clashError, setClashError] = useState("");

  // Global Data
  const [sections, setSections] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [savedTimetables, setSavedTimetables] = useState<any[]>([]);
  
  // Framework State
  const [totalPeriods, setTotalPeriods] = useState(8);
  const [breakAfter, setBreakAfter] = useState(4);
  const [schoolPeriods, setSchoolPeriods] = useState<string[]>([]);

  // 🚀 SMART ALLOTMENT STATES
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [fromDay, setFromDay] = useState("Monday");
  const [toDay, setToDay] = useState("Friday");
  
  // Local Grid State for Preview
  const [gridData, setGridData] = useState<Record<string, { subject: string, teacherId: string, teacherName: string }>>({});

  useEffect(() => {
    const unsubSections = onSnapshot(query(collection(db, "sections")), (snap) => setSections(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubStaff = onSnapshot(query(collection(db, "staff")), (snap) => setStaff(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTimetables = onSnapshot(query(collection(db, "timetables")), (snap) => setSavedTimetables(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    const unsubSettings = onSnapshot(doc(db, "settings", "timetableConfig"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTotalPeriods(data.totalPeriods || 8);
        setBreakAfter(data.breakAfter || 4);
        setSchoolPeriods(data.periodsArray || []);
      }
    });

    return () => { unsubSections(); unsubStaff(); unsubTimetables(); unsubSettings(); };
  }, []);

  // Auto-load timetable for preview when class/section selected
  useEffect(() => {
    if (selectedClass && selectedSection) {
      const docId = `${norm(selectedClass)}_${norm(selectedSection)}`;
      const existing = savedTimetables.find(t => t.id === docId);
      setGridData(existing?.schedule || {});
    } else {
      setGridData({});
    }
  }, [selectedClass, selectedSection, savedTimetables]);

  const availableClasses = Array.from(new Set(sections.map(s => s.classGrade)));
  const availableSections = sections.filter(s => norm(s.classGrade) === norm(selectedClass));
  const activeSectionData = sections.find(s => norm(s.classGrade) === norm(selectedClass) && norm(s.sectionName) === norm(selectedSection));
  const availableSubjects = activeSectionData?.subjects ? [...(activeSectionData.subjects.core || []), ...(activeSectionData.subjects.electives || [])] : [];

  const displayStaff = staff.filter(s => {
    const des = norm(s.professional?.designation);
    return des.includes("teacher") || des.includes("s.s.e") || des.includes("lecturer");
  });

  const handleSaveTimetableConfig = async () => {
    setLoading(true);
    try {
      const newPeriods: string[] = [];
      for (let i = 1; i <= totalPeriods; i++) {
        newPeriods.push(getOrdinal(i));
        if (i === breakAfter) newPeriods.push("Break");
      }
      await setDoc(doc(db, "settings", "timetableConfig"), {
        totalPeriods, breakAfter, periodsArray: newPeriods, updatedAt: serverTimestamp()
      }, { merge: true });
      setSuccess(true); setTimeout(() => setSuccess(false), 3000);
    } catch (err) { alert("Failed to save."); } finally { setLoading(false); }
  };

  // 🧠 THE MAGIC BATCH ALLOTMENT & CLASH DETECTION
  const handleBatchAllot = () => {
    setClashError("");
    if (!selectedPeriod || !selectedSubject || !selectedTeacher || !fromDay || !toDay) {
      return alert("Please fill all allotment fields.");
    }

    const startIndex = DAYS.indexOf(fromDay);
    const endIndex = DAYS.indexOf(toDay);
    if (startIndex > endIndex) {
      return setClashError("Invalid day range. 'From Day' must be before 'To Day'.");
    }

    let hasClash = false;
    let clashDetails = "";

    // 🛑 1. Clash Detection Loop
    for (let i = startIndex; i <= endIndex; i++) {
      const currentDay = DAYS[i];
      const key = `${currentDay}-${selectedPeriod}`;

      // Check all other saved timetables
      for (const tt of savedTimetables) {
        // Skip checking the same class we are editing
        if (norm(tt.classGrade) === norm(selectedClass) && norm(tt.section) === norm(selectedSection)) continue;

        if (tt.schedule && tt.schedule[key] && tt.schedule[key].teacherId === selectedTeacher) {
           hasClash = true;
           const teacherName = displayStaff.find(s => s.id === selectedTeacher)?.personal?.fullName;
           clashDetails = `🚨 CLASH DETECTED: ${teacherName} is already teaching ${tt.classGrade} - ${tt.section} on ${currentDay} in the ${selectedPeriod}.`;
           break;
        }
      }
      if (hasClash) break;
    }

    if (hasClash) {
      setClashError(clashDetails);
      return;
    }

    // ✅ 2. Apply Allotment to Local Grid
    setGridData(prev => {
      const newGrid = { ...prev };
      const teacherObj = displayStaff.find(s => s.id === selectedTeacher);
      
      for (let i = startIndex; i <= endIndex; i++) {
        const currentDay = DAYS[i];
        const key = `${currentDay}-${selectedPeriod}`;
        newGrid[key] = {
          subject: selectedSubject,
          teacherId: selectedTeacher,
          teacherName: teacherObj ? teacherObj.personal?.fullName : ""
        };
      }
      return newGrid;
    });
  };

  // Remove individual cell data
  const handleClearCell = (day: string, period: string) => {
    setGridData(prev => {
      const newGrid = { ...prev };
      delete newGrid[`${day}-${period}`];
      return newGrid;
    });
  };

  // Save the entire grid to Firebase
  const handlePublishTimetable = async () => {
    if (!selectedClass || !selectedSection) return;
    setLoading(true);
    try {
      const docId = `${norm(selectedClass)}_${norm(selectedSection)}`;
      await setDoc(doc(db, "timetables", docId), {
        classGrade: selectedClass, section: selectedSection, schedule: gridData, updatedAt: serverTimestamp()
      });
      setSuccess(true); setTimeout(() => setSuccess(false), 3000);
    } catch (err) { alert("Failed to publish timetable."); } finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Admin Control Panel</h1>
        <p className="text-sm text-slate-500 mt-1">Configure school structure and assign routines.</p>
      </div>

      {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-100 font-bold"><CheckCircle2 size={20}/> Changes Saved Successfully!</div>}
      {clashError && <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 border border-red-200 font-bold shadow-sm animate-bounce"><AlertCircle size={20}/> {clashError}</div>}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* --- SETTINGS SIDEBAR --- */}
        <div className="md:col-span-4 lg:col-span-3 space-y-2">
           <button onClick={() => setActiveTab("framework")} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all ${activeTab === "framework" ? "bg-[#0F172A] text-white shadow-md" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"}`}>
             <Clock size={18} className={activeTab === "framework" ? "text-[#3ac47d]" : ""} /> <div className="text-left"><p>1. Global Framework</p><p className="text-[9px] opacity-70 uppercase tracking-widest">Periods & Break Setup</p></div>
           </button>
           <button onClick={() => setActiveTab("allotment")} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all ${activeTab === "allotment" ? "bg-[#0F172A] text-white shadow-md" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"}`}>
             <CalendarRange size={18} className={activeTab === "allotment" ? "text-[#3ac47d]" : ""} /> <div className="text-left"><p>2. Timetable Allotment</p><p className="text-[9px] opacity-70 uppercase tracking-widest">Smart Clash-Free Entry</p></div>
           </button>
           
           <div className="pt-4 border-t border-slate-200 mt-4 space-y-2">
              <button onClick={() => setActiveTab("identity")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === "identity" ? "bg-slate-200 text-[#0F172A]" : "text-slate-400 hover:bg-slate-50"}`}>
                <Building2 size={16}/> <span className="text-sm">School Identity</span>
              </button>
              <button onClick={() => setActiveTab("academic")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === "academic" ? "bg-slate-200 text-[#0F172A]" : "text-slate-400 hover:bg-slate-50"}`}>
                <Layers size={16}/> <span className="text-sm">Academic Setup</span>
              </button>
           </div>
        </div>

        {/* --- SETTINGS CONTENT --- */}
        <div className="md:col-span-8 lg:col-span-9">
           
           {/* 1. FRAMEWORK SETUP */}
           {activeTab === "framework" && (
             <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 animate-fade-in-up">
                <h2 className="text-xl font-black text-[#0F172A] flex items-center gap-2 mb-6"><Clock className="text-[#3ac47d]"/> Timetable Framework</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Daily Periods</label>
                     <input type="number" value={totalPeriods} onChange={e => setTotalPeriods(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-black text-xl text-[#0F172A] outline-none focus:border-[#3ac47d]" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Break / Recess After</label>
                     <select value={breakAfter} onChange={e => setBreakAfter(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-black text-xl text-orange-600 outline-none focus:border-[#3ac47d]">
                        {Array.from({length: totalPeriods}, (_, i) => i + 1).map(num => (
                           <option key={num} value={num}>After {getOrdinal(num)} Period</option>
                        ))}
                     </select>
                   </div>
                </div>
                <button onClick={handleSaveTimetableConfig} disabled={loading} className="bg-[#0F172A] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-md">
                  {loading ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>} Save Framework
                </button>
             </div>
           )}

           {/* 2. THE SMART ALLOTMENT ENGINE */}
           {activeTab === "allotment" && (
             <div className="space-y-6 animate-fade-in-up">
                
                {/* Configuration Panel */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                   <h2 className="text-lg font-black text-[#0F172A] flex items-center gap-2 mb-6">
                     <CalendarRange className="text-[#3ac47d]"/> Smart Batch Allotment
                   </h2>
                   
                   {/* Step 1: Target Class */}
                   <div className="grid grid-cols-2 gap-4 mb-6 border-b border-slate-100 pb-6">
                      <div className="space-y-1">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Class</label>
                         <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSection(""); }} className="w-full bg-slate-50 outline-none rounded-xl px-3 py-2.5 text-sm border border-slate-200 font-bold focus:border-[#3ac47d]">
                           <option value="">Choose Class</option>{availableClasses.map(cls => <option key={cls as string} value={cls as string}>{cls as string}</option>)}
                         </select>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Section</label>
                         <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} disabled={!selectedClass} className="w-full bg-slate-50 outline-none rounded-xl px-3 py-2.5 text-sm border border-slate-200 font-bold focus:border-[#3ac47d] disabled:opacity-50">
                           <option value="">Choose Section</option>{availableSections.map(sec => <option key={sec.id} value={sec.sectionName}>{sec.sectionName}</option>)}
                         </select>
                      </div>
                   </div>

                   {/* Step 2: Batch Entry Form */}
                   <div className={`transition-opacity duration-300 ${!selectedClass || !selectedSection ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 items-end">
                         <div className="space-y-1">
                           <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Target Period</label>
                           <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)} className="w-full bg-blue-50 outline-none rounded-lg px-3 py-2.5 text-xs font-bold text-blue-700">
                             <option value="">Period</option>{schoolPeriods.filter(p => p !== "Break").map(p => <option key={p} value={p}>{p}</option>)}
                           </select>
                         </div>
                         <div className="space-y-1">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</label>
                           <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full bg-slate-50 outline-none rounded-lg px-3 py-2.5 text-xs font-bold border border-slate-200">
                             <option value="">Subject</option>{availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                             <option value="Games">Games / PT</option><option value="Library">Library</option>
                           </select>
                         </div>
                         <div className="space-y-1">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Teacher</label>
                           <select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)} className="w-full bg-slate-50 outline-none rounded-lg px-3 py-2.5 text-xs font-bold border border-slate-200">
                             <option value="">Teacher</option>{displayStaff.map(t => <option key={t.id} value={t.id}>{t.personal?.fullName}</option>)}
                           </select>
                         </div>
                         <div className="space-y-1">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Day Range</label>
                           <div className="flex items-center gap-1">
                              <select value={fromDay} onChange={e => setFromDay(e.target.value)} className="w-full bg-slate-50 outline-none rounded-lg px-1 py-2.5 text-[10px] font-bold border border-slate-200">
                                {DAYS.map(d => <option key={d} value={d}>{d.substring(0,3)}</option>)}
                              </select>
                              <span className="text-slate-400 font-bold">-</span>
                              <select value={toDay} onChange={e => setToDay(e.target.value)} className="w-full bg-slate-50 outline-none rounded-lg px-1 py-2.5 text-[10px] font-bold border border-slate-200">
                                {DAYS.map(d => <option key={d} value={d}>{d.substring(0,3)}</option>)}
                              </select>
                           </div>
                         </div>
                         <button onClick={handleBatchAllot} className="bg-[#3ac47d] text-white h-[42px] rounded-lg font-black text-xs hover:bg-[#2eaa6a] shadow-sm transition-colors uppercase tracking-widest">
                            Apply Batch
                         </button>
                      </div>
                   </div>
                </div>

                {/* Live Preview Grid */}
                {selectedClass && selectedSection && (
                   <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                      <div className="px-6 py-4 bg-[#0F172A] text-white flex justify-between items-center">
                         <div>
                            <h3 className="font-black text-sm uppercase">{selectedClass} - {selectedSection} Preview</h3>
                            <p className="text-[10px] text-slate-400">Review changes below before publishing to the live server.</p>
                         </div>
                         <button onClick={handlePublishTimetable} disabled={loading} className="bg-white text-[#0F172A] px-4 py-1.5 rounded-lg text-xs font-black flex items-center gap-2 hover:bg-slate-200 transition-colors">
                           {loading ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} Publish Routine
                         </button>
                      </div>
                      
                      <div className="p-4 overflow-x-auto">
                         <table className="w-full min-w-[700px] border-collapse text-left">
                            <thead>
                               <tr>
                                  <th className="bg-slate-100 text-slate-500 font-black uppercase text-[10px] p-3 border border-slate-200">Period</th>
                                  {DAYS.map(day => <th key={day} className="bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-[10px] p-3 border border-slate-200 text-center">{day}</th>)}
                               </tr>
                            </thead>
                            <tbody>
                               {schoolPeriods.map(period => (
                                 <tr key={period}>
                                    <td className="border border-slate-200 p-2 text-center bg-slate-50 font-black text-slate-600 text-xs">{period}</td>
                                    {DAYS.map(day => {
                                       if (period === "Break") return <td key={`${day}-${period}`} className="border border-orange-100 bg-orange-50 p-2 text-center"><span className="text-orange-400 font-black text-[10px] uppercase tracking-[0.2em]">Break</span></td>;
                                       
                                       const key = `${day}-${period}`;
                                       const cell = gridData[key];
                                       
                                       return (
                                         <td key={key} className="border border-slate-200 p-1.5 text-center relative group h-14 min-w-[100px]">
                                            {cell ? (
                                               <div className="flex flex-col items-center justify-center h-full bg-blue-50/50 rounded-md border border-blue-100 p-1">
                                                  <span className="font-black text-[#0F172A] text-[10px] uppercase">{cell.subject}</span>
                                                  <span className="text-[9px] font-bold text-slate-500 truncate w-full">{cell.teacherName}</span>
                                                  <button onClick={() => handleClearCell(day, period)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-100 text-red-600 p-0.5 rounded text-[8px] transition-opacity" title="Clear Period">
                                                    <Trash2 size={10}/>
                                                  </button>
                                               </div>
                                            ) : (
                                               <span className="text-[9px] font-bold text-slate-300 uppercase">Empty</span>
                                            )}
                                         </td>
                                       );
                                    })}
                                 </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                   </div>
                )}
             </div>
           )}

           {activeTab !== "timetable" && activeTab !== "framework" && activeTab !== "allotment" && (
             <div className="bg-white rounded-3xl p-20 shadow-sm border border-slate-100 text-center text-slate-400 font-bold flex flex-col items-center">
                <ShieldCheck size={48} className="mb-4 opacity-50"/>
                This module is under construction. Select "Timetable Allotment" to proceed.
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
