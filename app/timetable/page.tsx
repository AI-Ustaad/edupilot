"use client";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, setDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../context/AuthContext";
import { 
  Calendar as CalendarIcon, Users, UserCircle, Repeat, 
  Save, CheckCircle2, Settings, Loader2, Clock, AlertCircle
} from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const norm = (str?: string) => (str || "").trim().toLowerCase();

export default function TimeTablePage() {
  const { user } = useAuth(); // To check if admin
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [activeTab, setActiveTab] = useState("class"); 

  // Data States
  const [sections, setSections] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [savedTimetables, setSavedTimetables] = useState<any[]>([]);
  
  // 🚀 DYNAMIC TIMETABLE SETTINGS (From Admin)
  const [schoolPeriods, setSchoolPeriods] = useState<string[]>([]);
  const [setupConfig, setSetupConfig] = useState({ totalPeriods: 8, breakAfter: 4 });

  // Selection States
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [gridData, setGridData] = useState<Record<string, { subject: string, teacherId: string, teacherName: string }>>({});

  useEffect(() => {
    setIsMounted(true);
    const unsubSections = onSnapshot(query(collection(db, "sections")), (snap) => setSections(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubStaff = onSnapshot(query(collection(db, "staff")), (snap) => setStaff(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTimetables = onSnapshot(query(collection(db, "timetables")), (snap) => setSavedTimetables(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    // 🔗 FETCH GLOBAL TIMETABLE SETTINGS
    const unsubSettings = onSnapshot(doc(db, "settings", "timetableConfig"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSetupConfig({ totalPeriods: data.totalPeriods, breakAfter: data.breakAfter });
        setSchoolPeriods(data.periodsArray || []);
      } else {
        // Fallback default
        setSchoolPeriods(["1st", "2nd", "3rd", "4th", "Break", "5th", "6th", "7th", "8th"]);
      }
    });

    return () => { unsubSections(); unsubStaff(); unsubTimetables(); unsubSettings(); };
  }, []);

  // Auto-load grid data
  useEffect(() => {
    if (selectedClass && selectedSection) {
      const docId = `${norm(selectedClass)}_${norm(selectedSection)}`;
      const existing = savedTimetables.find(t => t.id === docId);
      if (existing && existing.schedule) {
        setGridData(existing.schedule);
      } else {
        setGridData({});
      }
    } else {
      setGridData({});
    }
  }, [selectedClass, selectedSection, savedTimetables]);

  const availableClasses = Array.from(new Set(sections.map(s => s.classGrade)));
  const availableSections = sections.filter(s => norm(s.classGrade) === norm(selectedClass));
  const activeSectionData = sections.find(s => norm(s.classGrade) === norm(selectedClass) && norm(s.sectionName) === norm(selectedSection));
  const availableSubjects = activeSectionData?.subjects ? [...(activeSectionData.subjects.core || []), ...(activeSectionData.subjects.electives || [])] : [];

  const teachersList = staff.filter(s => {
    const designation = norm(s.professional?.designation);
    return designation.includes("teacher") || designation.includes("s.s.e") || designation.includes("lecturer");
  });
  const displayStaff = teachersList.length > 0 ? teachersList : staff;

  const handleCellChange = (day: string, period: string, field: "subject" | "teacherId", value: string) => {
    const key = `${day}-${period}`;
    setGridData(prev => {
      const cell = prev[key] || { subject: "", teacherId: "", teacherName: "" };
      let newCell = { ...cell, [field]: value };
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
        classGrade: selectedClass, section: selectedSection, schedule: gridData, updatedAt: serverTimestamp()
      });
      setSuccess(true); setTimeout(() => setSuccess(false), 3000);
    } catch (error) { alert("Failed to save timetable."); } finally { setLoading(false); }
  };

  // 🚀 ADMIN: SAVE CONFIGURATION
  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      let newPeriods = [];
      for (let i = 1; i <= setupConfig.totalPeriods; i++) {
        newPeriods.push(`${i}${i===1?'st':i===2?'nd':i===3?'rd':'th'}`);
        if (i === Number(setupConfig.breakAfter)) newPeriods.push("Break");
      }
      await setDoc(doc(db, "settings", "timetableConfig"), {
        totalPeriods: Number(setupConfig.totalPeriods),
        breakAfter: Number(setupConfig.breakAfter),
        periodsArray: newPeriods,
        updatedAt: serverTimestamp()
      });
      setSuccess(true); setTimeout(() => setSuccess(false), 3000);
    } catch (err) { alert("Failed to save settings."); } finally { setLoading(false); }
  };

  if (!isMounted) return null;

  const TABS = [
    { id: "class", label: "Class-wise Time Table", icon: Users, desc: "Create & edit schedules for sections." },
    { id: "teacher", label: "Teacher-wise Schedule", icon: UserCircle, desc: "Auto-generated routines for staff." },
    { id: "arrangement", label: "Arrangements (Proxy)", icon: Repeat, desc: "Manage absentees & free teachers." },
    { id: "setup", label: "Admin Setup", icon: Settings, desc: "Configure global school periods." },
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-3">
            <Clock className="text-[#3ac47d]"/> Time Table Master
          </h1>
          <p className="text-sm text-slate-500 mt-1">Smart scheduling & proxy management engine.</p>
        </div>
      </div>

      {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-100 font-bold"><CheckCircle2 size={20}/> Saved Successfully!</div>}

      {/* TABS NAVIGATION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TABS.map(tab => (
           <div 
             key={tab.id} 
             onClick={() => setActiveTab(tab.id)} 
             className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-300 ${activeTab === tab.id ? 'bg-[#0F172A] border-[#0F172A] text-white shadow-lg scale-[1.02]' : 'bg-white border-transparent hover:border-slate-200 text-slate-600 shadow-sm'}`}
           >
             <div className="flex items-center justify-between mb-2">
                <tab.icon size={24} className={activeTab === tab.id ? "text-[#3ac47d]" : "text-slate-400"} />
             </div>
             <h3 className={`font-black text-sm lg:text-base ${activeTab === tab.id ? 'text-white' : 'text-[#0F172A]'}`}>{tab.label}</h3>
             <p className={`text-[10px] mt-1 font-medium ${activeTab === tab.id ? 'text-slate-400' : 'text-slate-500'}`}>{tab.desc}</p>
           </div>
        ))}
      </div>

      {/* 🚀 TAB 4: ADMIN SETUP (Global Configuration) */}
      {activeTab === "setup" && (
         <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-fade-in-up max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-6">
               <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><Settings size={24}/></div>
               <div>
                 <h2 className="text-xl font-black text-[#0F172A]">School Timetable Framework</h2>
                 <p className="text-xs text-slate-500 font-medium">Define how many periods your school has and when the break happens.</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Daily Periods</label>
                 <input type="number" min="1" max="15" value={setupConfig.totalPeriods} onChange={e => setSetupConfig({...setupConfig, totalPeriods: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-black text-xl text-[#0F172A] outline-none focus:border-purple-400" />
                 <p className="text-[10px] text-slate-400">Total instructional periods excluding break.</p>
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Break / Recess After Period</label>
                 <select value={setupConfig.breakAfter} onChange={e => setSetupConfig({...setupConfig, breakAfter: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-black text-xl text-orange-600 outline-none focus:border-purple-400">
                    {Array.from({length: setupConfig.totalPeriods}, (_, i) => i + 1).map(num => (
                       <option key={num} value={num}>After {num}{num===1?'st':num===2?'nd':num===3?'rd':'th'} Period</option>
                    ))}
                 </select>
                 <p className="text-[10px] text-slate-400">When does the recess happen?</p>
               </div>
            </div>

            <button onClick={handleSaveConfig} disabled={loading} className="w-full bg-[#0F172A] text-white py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-md">
               {loading ? <Loader2 size={20} className="animate-spin"/> : <Save size={20}/>} 
               Apply Configuration to Entire School
            </button>
         </div>
      )}

      {/* 🚀 TAB 1: CLASS-WISE TIME TABLE */}
      {activeTab === "class" && (
         <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
            
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

            <div className="p-6 overflow-x-auto">
               {!selectedClass || !selectedSection ? (
                 <div className="py-20 flex flex-col items-center justify-center opacity-40">
                    <CalendarIcon size={60} className="mb-4 text-slate-400" />
                    <h3 className="text-xl font-black text-slate-600">Select Class & Section</h3>
                 </div>
               ) : schoolPeriods.length === 0 ? (
                 <div className="py-20 flex flex-col items-center justify-center">
                    <AlertCircle size={60} className="mb-4 text-orange-400" />
                    <h3 className="text-xl font-black text-slate-600">Timetable Not Configured</h3>
                    <p className="font-medium text-sm mt-1 text-slate-500">Please go to "Admin Setup" tab to configure school periods first.</p>
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
                       {schoolPeriods.map(period => (
                         <tr key={period} className={period === "Break" ? "bg-orange-50" : "hover:bg-slate-50 transition-colors"}>
                            <td className="border border-slate-200 p-3 text-center bg-slate-50 font-black text-slate-600 text-sm">
                               {period}
                            </td>
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
                                       <select value={cellData.subject} onChange={e => handleCellChange(day, period, "subject", e.target.value)} className={`w-full text-xs font-bold p-1.5 rounded-md outline-none transition-colors border ${cellData.subject ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-100 border-transparent text-slate-500 hover:bg-slate-200'}`}>
                                         <option value="">Subject...</option>
                                         {availableSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                         <option value="Games">Games / PT</option><option value="Library">Library</option><option value="Test">Test / Revision</option>
                                       </select>
                                       <select value={cellData.teacherId} onChange={e => handleCellChange(day, period, "teacherId", e.target.value)} className={`w-full text-[10px] font-bold p-1.5 rounded-md outline-none transition-colors border ${cellData.teacherId ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                                         <option value="">Teacher...</option>
                                         {displayStaff.map(staff => (<option key={staff.id} value={staff.id}>{staff.personal?.fullName || "Unnamed"}</option>))}
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

      {/* TABS 2 & 3 */}
      {activeTab === "teacher" && (
         <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-20 flex flex-col items-center justify-center animate-fade-in-up text-center">
            <UserCircle size={80} className="text-blue-500 mb-6 opacity-80" />
            <h2 className="text-3xl font-black text-[#0F172A] mb-2">Teacher-wise Schedule Engine</h2>
            <p className="text-slate-500 font
