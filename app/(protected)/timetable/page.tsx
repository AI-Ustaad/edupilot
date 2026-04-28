"use client";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Calendar as CalendarIcon, Users, UserCircle, Repeat, 
  Save, CheckCircle2, Loader2, Clock, AlertCircle, ShieldAlert
} from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const norm = (str?: string) => (str || "").trim().toLowerCase();

export default function TimeTablePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 🚀 ROLE SIMULATOR (To test Admin vs Teacher view)
  const [simulatedRole, setSimulatedRole] = useState("admin"); // 'admin' or 'teacher'
  const [simulatedTeacherId, setSimulatedTeacherId] = useState("");

  const [activeTab, setActiveTab] = useState("class"); 

  // Data States
  const [sections, setSections] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [savedTimetables, setSavedTimetables] = useState<any[]>([]);
  const [schoolPeriods, setSchoolPeriods] = useState<string[]>([]);

  // Admin Selection States
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [gridData, setGridData] = useState<Record<string, { subject: string, teacherId: string, teacherName: string }>>({});

  useEffect(() => {
    setIsMounted(true);
    const unsubSections = onSnapshot(query(collection(db, "sections")), (snap) => setSections(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubStaff = onSnapshot(query(collection(db, "staff")), (snap) => setStaff(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTimetables = onSnapshot(query(collection(db, "timetables")), (snap) => setSavedTimetables(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubSettings = onSnapshot(doc(db, "settings", "timetableConfig"), (docSnap) => {
      if (docSnap.exists()) setSchoolPeriods(docSnap.data().periodsArray || []);
    });
    return () => { unsubSections(); unsubStaff(); unsubTimetables(); unsubSettings(); };
  }, []);

  // Admin Grid Loader
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

  const handleCellChange = (day: string, period: string, field: "subject" | "teacherId", value: string) => {
    const key = `${day}-${period}`;
    setGridData(prev => {
      const cell = prev[key] || { subject: "", teacherId: "", teacherName: "" };
      let newCell = { ...cell, [field]: value };
      if (field === "teacherId") {
        const t = displayStaff.find(s => s.id === value);
        newCell.teacherName = t ? t.personal?.fullName : "";
      }
      return { ...prev, [key]: newCell };
    });
  };

  const handleSaveTimetable = async () => {
    if (!selectedClass || !selectedSection) return;
    setLoading(true);
    try {
      await setDoc(doc(db, "timetables", `${norm(selectedClass)}_${norm(selectedSection)}`), {
        classGrade: selectedClass, section: selectedSection, schedule: gridData, updatedAt: serverTimestamp()
      });
      setSuccess(true); setTimeout(() => setSuccess(false), 3000);
    } catch (error) { alert("Error saving"); } finally { setLoading(false); }
  };

  if (!isMounted) return null;

  // 🧠 TEACHER'S PERSONAL TIMETABLE LOGIC
  const generateTeacherSchedule = () => {
    if (!simulatedTeacherId) return {};
    let tSchedule: Record<string, any> = {};
    savedTimetables.forEach(tt => {
      if (!tt.schedule) return;
      Object.keys(tt.schedule).forEach(key => {
        if (tt.schedule[key].teacherId === simulatedTeacherId) {
          tSchedule[key] = {
            subject: tt.schedule[key].subject,
            classLabel: `${tt.classGrade} - ${tt.section}`
          };
        }
      });
    });
    return tSchedule;
  };
  const myTeacherSchedule = generateTeacherSchedule();

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      
      {/* 🚀 ROLE SIMULATOR BAR */}
      <div className="bg-yellow-100 border border-yellow-300 p-4 rounded-xl flex flex-wrap items-center gap-4 shadow-sm relative z-50">
         <div className="flex items-center gap-2 text-yellow-800 font-black"><ShieldAlert size={18}/> RBAC Simulator:</div>
         <select value={simulatedRole} onChange={e => { setSimulatedRole(e.target.value); setActiveTab(e.target.value === "admin" ? "class" : "teacher_view"); }} className="bg-white border border-yellow-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none">
           <option value="admin">Login as: ADMIN</option>
           <option value="teacher">Login as: TEACHER</option>
         </select>
         {simulatedRole === "teacher" && (
           <select value={simulatedTeacherId} onChange={e => setSimulatedTeacherId(e.target.value)} className="bg-white border border-yellow-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none">
             <option value="">-- Select Teacher --</option>
             {displayStaff.map(t => <option key={t.id} value={t.id}>{t.personal?.fullName}</option>)}
           </select>
         )}
      </div>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-3">
            <Clock className="text-[#3ac47d]"/> {simulatedRole === "admin" ? "Time Table Master" : "My Schedule"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{simulatedRole === "admin" ? "Manage all classes & proxies." : "Your personalized weekly routine."}</p>
        </div>
      </div>

      {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-100 font-bold"><CheckCircle2 size={20}/> Saved Successfully!</div>}

      {/* 👑 ADMIN VIEW */}
      {simulatedRole === "admin" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
             <div onClick={() => setActiveTab("class")} className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-300 ${activeTab === "class" ? 'bg-[#0F172A] border-[#0F172A] text-white shadow-lg scale-[1.02]' : 'bg-white border-transparent text-slate-600 shadow-sm'}`}>
               <Users size={24} className={activeTab === "class" ? "text-[#3ac47d]" : "text-slate-400"} mb-2/>
               <h3 className="font-black text-lg">Class Timetables</h3>
               <p className="text-xs mt-1 font-medium opacity-70">Create schedules for all sections.</p>
             </div>
             <div onClick={() => setActiveTab("arrangements")} className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-300 ${activeTab === "arrangements" ? 'bg-[#0F172A] border-[#0F172A] text-white shadow-lg scale-[1.02]' : 'bg-white border-transparent text-slate-600 shadow-sm'}`}>
               <Repeat size={24} className={activeTab === "arrangements" ? "text-[#3ac47d]" : "text-slate-400"} mb-2/>
               <h3 className="font-black text-lg">Daily Arrangements</h3>
               <p className="text-xs mt-1 font-medium opacity-70">Assign proxies for absent teachers.</p>
             </div>
          </div>

          {activeTab === "class" && (
             <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
                <div className="bg-slate-50 border-b border-slate-100 p-6 flex flex-wrap lg:flex-nowrap items-end justify-between gap-4">
                   <div className="flex gap-4 w-full lg:w-auto">
                     <div className="space-y-2 w-48">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Class</label>
                        <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSection(""); }} className="w-full bg-white outline-none rounded-xl px-4 py-3 text-sm border border-slate-200 font-bold focus:border-[#3ac47d]">
                          <option value="">-- Choose --</option>
                          {availableClasses.map(cls => <option key={cls as string} value={cls as string}>{cls as string}</option>)}
                        </select>
                     </div>
                     <div className="space-y-2 w-48">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Section</label>
                        <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} disabled={!selectedClass} className="w-full bg-white outline-none rounded-xl px-4 py-3 text-sm border border-slate-200 font-bold disabled:opacity-50 focus:border-[#3ac47d]">
                          <option value="">-- Choose --</option>
                          {availableSections.map(sec => <option key={sec.id} value={sec.sectionName}>{sec.sectionName}</option>)}
                        </select>
                     </div>
                   </div>
                   <button onClick={handleSaveTimetable} disabled={!selectedClass || !selectedSection || loading} className="bg-[#3ac47d] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#2eaa6a] shadow-md disabled:opacity-50">
                     {loading ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>} Save Schedule
                   </button>
                </div>

                <div className="p-6 overflow-x-auto">
                   {schoolPeriods.length === 0 ? (
                     <div className="py-10 text-center"><AlertCircle size={40} className="mx-auto mb-2 text-orange-400"/><p className="font-bold text-slate-500">Configure periods in Admin Settings first.</p></div>
                   ) : (
                     <table className="w-full min-w-[800px] border-collapse">
                        <thead>
                           <tr>
                              <th className="bg-[#0F172A] text-white font-black uppercase text-xs p-4 border border-slate-800">Period</th>
                              {DAYS.map(day => <th key={day} className="bg-[#0F172A] text-white font-black uppercase text-xs p-4 border border-slate-800">{day}</th>)}
                           </tr>
                        </thead>
                        <tbody>
                           {schoolPeriods.map(period => (
                             <tr key={period} className={period === "Break" ? "bg-orange-50" : ""}>
                                <td className="border border-slate-200 p-3 text-center bg-slate-50 font-black text-slate-600 text-sm">{period}</td>
                                {DAYS.map(day => {
                                   if (period === "Break") return <td key={`${day}-${period}`} className="border border-orange-200 p-3 text-center"><span className="text-orange-500 font-black text-xs uppercase tracking-[0.3em]">Recess</span></td>;
                                   const key = `${day}-${period}`;
                                   const cell = gridData[key] || { subject: "", teacherId: "" };
                                   return (
                                     <td key={key} className="border border-slate-200 p-2 align-top">
                                        <div className="space-y-1.5">
                                           <select value={cell.subject} onChange={e => handleCellChange(day, period, "subject", e.target.value)} className="w-full text-xs font-bold p-1.5 rounded-md border outline-none bg-slate-50">
                                             <option value="">Subject...</option>{availableSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                             <option value="Games">Games / PT</option><option value="Library">Library</option><option value="Test">Test / Revision</option>
                                           </select>
                                           <select value={cell.teacherId} onChange={e => handleCellChange(day, period, "teacherId", e.target.value)} className="w-full text-[10px] font-bold p-1.5 rounded-md border outline-none bg-white">
                                             <option value="">Teacher...</option>{displayStaff.map(t => <option key={t.id} value={t.id}>{t.personal?.fullName}</option>)}
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
          {activeTab === "arrangements" && (
             <div className="bg-white rounded-3xl p-20 text-center"><Repeat size={60} className="mx-auto mb-4 text-slate-300"/><h2 className="text-xl font-black text-slate-500">Arrangements Module under construction</h2></div>
          )}
        </>
      )}

      {/* 👨‍🏫 TEACHER VIEW (Read-Only Dynamic Grid) */}
      {simulatedRole === "teacher" && (
         <div className="bg-white rounded-3xl shadow-lg border border-blue-100 overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex justify-between items-center">
               <div>
                 <h2 className="text-xl font-black flex items-center gap-2"><UserCircle size={20}/> Personalized Weekly Routine</h2>
                 <p className="text-xs text-blue-200 font-medium mt-1">Automatically extracted from all class timetables.</p>
               </div>
            </div>

            <div className="p-6 overflow-x-auto">
               {!simulatedTeacherId ? (
                 <div className="py-20 text-center text-slate-400 font-bold"><p>Please select a teacher from the yellow simulator bar above.</p></div>
               ) : schoolPeriods.length === 0 ? (
                 <p className="py-10 text-center font-bold text-slate-500">No school periods defined.</p>
               ) : (
                 <table className="w-full min-w-[800px] border-collapse">
                    <thead>
                       <tr>
                          <th className="bg-slate-100 text-slate-500 font-black uppercase text-xs p-4 border border-slate-200">Period</th>
                          {DAYS.map(day => <th key={day} className="bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-xs p-4 border border-slate-200">{day}</th>)}
                       </tr>
                    </thead>
                    <tbody>
                       {schoolPeriods.map(period => (
                         <tr key={period} className={period === "Break" ? "bg-orange-50" : ""}>
                            <td className="border border-slate-200 p-3 text-center bg-slate-50 font-black text-slate-600 text-sm">{period}</td>
                            {DAYS.map(day => {
                               if (period === "Break") return <td key={`${day}-${period}`} className="border border-orange-200 p-3 text-center"><span className="text-orange-500 font-black text-xs uppercase tracking-[0.3em]">Recess</span></td>;
                               const key = `${day}-${period}`;
                               const myDuty = myTeacherSchedule[key];

                               return (
                                 <td key={key} className={`border p-3 text-center transition-colors ${myDuty ? 'bg-blue-50 border-blue-200 shadow-inner' : 'border-slate-200 bg-white'}`}>
                                    {myDuty ? (
                                       <div className="flex flex-col items-center justify-center">
                                          <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mb-1">{myDuty.classLabel}</span>
                                          <span className="font-bold text-blue-800 text-xs">{myDuty.subject}</span>
                                       </div>
                                    ) : (
                                       <span className="text-[10px] font-bold text-slate-300 uppercase">Free</span>
                                    )}
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

    </div>
  );
}
