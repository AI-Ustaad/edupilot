"use client";
import React, { useState, useEffect } from "react";
import { collection, doc, setDoc, onSnapshot, serverTimestamp, query, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Building2, Layers, Wallet, ShieldCheck, Clock, Save, 
  CheckCircle2, Loader2, CalendarRange, AlertCircle, Trash2, PlusCircle
} from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const norm = (str?: string) => (str || "").trim().toLowerCase();

const getOrdinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("identity"); 
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [clashError, setClashError] = useState("");

  // 1. SCHOOL IDENTITY STATES
  const [schoolCategory, setSchoolCategory] = useState("Private School");
  const [registeredName, setRegisteredName] = useState("EduPilot High School");
  const [tagline, setTagline] = useState("");

  // 2. ACADEMIC STRUCTURE STATES
  const [sections, setSections] = useState<any[]>([]);
  const [newClassGrade, setNewClassGrade] = useState("");
  const [newSectionName, setNewSectionName] = useState("");

  // 3. FINANCIAL SETUP STATES
  const [currency, setCurrency] = useState("PKR");
  const [feeDueDate, setFeeDueDate] = useState("10");
  const [lateFine, setLateFine] = useState("50");

  // 4. TIMETABLE STATES
  const [staff, setStaff] = useState<any[]>([]);
  const [savedTimetables, setSavedTimetables] = useState<any[]>([]);
  const [totalPeriods, setTotalPeriods] = useState(8);
  const [breakAfter, setBreakAfter] = useState(4);
  const [schoolPeriods, setSchoolPeriods] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [fromDay, setFromDay] = useState("Monday");
  const [toDay, setToDay] = useState("Friday");
  const [gridData, setGridData] = useState<Record<string, { subject: string, teacherId: string, teacherName: string }>>({});

  // ==========================================
  // DATA FETCHING
  // ==========================================
  useEffect(() => {
    const unsubSections = onSnapshot(query(collection(db, "sections")), (snap) => setSections(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubStaff = onSnapshot(query(collection(db, "staff")), (snap) => setStaff(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTimetables = onSnapshot(query(collection(db, "timetables")), (snap) => setSavedTimetables(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    const unsubSettings = onSnapshot(doc(db, "settings", "globalConfig"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSchoolCategory(data.schoolCategory || "Private School");
        setRegisteredName(data.registeredName || "EduPilot High School");
        setTagline(data.tagline || "");
        setCurrency(data.currency || "PKR");
        setFeeDueDate(data.feeDueDate || "10");
        setLateFine(data.lateFine || "50");
      }
    });

    const unsubTimetableSettings = onSnapshot(doc(db, "settings", "timetableConfig"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTotalPeriods(data.totalPeriods || 8);
        setBreakAfter(data.breakAfter || 4);
        setSchoolPeriods(data.periodsArray || []);
      }
    });

    return () => { unsubSections(); unsubStaff(); unsubTimetables(); unsubSettings(); unsubTimetableSettings(); };
  }, []);

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
  const availableSubjects = activeSectionData?.subjects ? [...(activeSectionData.subjects.core || []), ...(activeSectionData.subjects.electives || [])] : ["English", "Urdu", "Math", "Science", "Islamiyat"];

  const displayStaff = staff.filter(s => {
    const des = norm(s.professional?.designation);
    return des.includes("teacher") || des.includes("s.s.e") || des.includes("lecturer");
  });

  // ==========================================
  // SAVE FUNCTIONS
  // ==========================================
  const handleSaveGlobalSettings = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, "settings", "globalConfig"), {
        schoolCategory, registeredName, tagline, currency, feeDueDate, lateFine, updatedAt: serverTimestamp()
      }, { merge: true });
      setSuccess(true); setTimeout(() => setSuccess(false), 3000);
    } catch (err) { alert("Failed to save."); } finally { setLoading(false); }
  };

  const handleAddSection = async () => {
    if (!newClassGrade || !newSectionName) return alert("Enter class and section name.");
    setLoading(true);
    try {
      const docId = `${norm(newClassGrade)}_${norm(newSectionName)}`;
      await setDoc(doc(db, "sections", docId), { classGrade: newClassGrade, sectionName: newSectionName, createdAt: serverTimestamp() });
      setNewClassGrade(""); setNewSectionName("");
      setSuccess(true); setTimeout(() => setSuccess(false), 3000);
    } catch (err) { alert("Failed to add section."); } finally { setLoading(false); }
  };
  
  const handleDeleteSection = async (id: string) => {
    if (confirm("Delete this section permanently?")) {
      await deleteDoc(doc(db, "sections", id));
    }
  };

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
    } catch (err) { alert("Failed to save framework."); } finally { setLoading(false); }
  };

  const handleBatchAllot = () => {
    setClashError("");
    if (!selectedPeriod || !selectedSubject || !selectedTeacher || !fromDay || !toDay) return alert("Please fill all fields.");

    const startIndex = DAYS.indexOf(fromDay);
    const endIndex = DAYS.indexOf(toDay);
    if (startIndex > endIndex) return setClashError("Invalid day range.");

    let hasClash = false;
    let clashDetails = "";

    for (let i = startIndex; i <= endIndex; i++) {
      const currentDay = DAYS[i];
      const key = `${currentDay}-${selectedPeriod}`;
      for (const tt of savedTimetables) {
        if (norm(tt.classGrade) === norm(selectedClass) && norm(tt.section) === norm(selectedSection)) continue;
        if (tt.schedule && tt.schedule[key] && tt.schedule[key].teacherId === selectedTeacher) {
           hasClash = true;
           const teacherName = displayStaff.find(s => s.id === selectedTeacher)?.personal?.fullName;
           clashDetails = `🚨 CLASH DETECTED: ${teacherName} is busy in ${tt.classGrade} - ${tt.section} on ${currentDay} in ${selectedPeriod}.`;
           break;
        }
      }
      if (hasClash) break;
    }

    if (hasClash) return setClashError(clashDetails);

    setGridData(prev => {
      const newGrid = { ...prev };
      const teacherObj = displayStaff.find(s => s.id === selectedTeacher);
      for (let i = startIndex; i <= endIndex; i++) {
        const currentDay = DAYS[i];
        const key = `${currentDay}-${selectedPeriod}`;
        newGrid[key] = { subject: selectedSubject, teacherId: selectedTeacher, teacherName: teacherObj ? teacherObj.personal?.fullName : "" };
      }
      return newGrid;
    });
  };

  const handleClearCell = (day: string, period: string) => {
    setGridData(prev => { const newGrid = { ...prev }; delete newGrid[`${day}-${period}`]; return newGrid; });
  };

  const handlePublishTimetable = async () => {
    if (!selectedClass || !selectedSection) return;
    setLoading(true);
    try {
      const docId = `${norm(selectedClass)}_${norm(selectedSection)}`;
      await setDoc(doc(db, "timetables", docId), { classGrade: selectedClass, section: selectedSection, schedule: gridData, updatedAt: serverTimestamp() });
      setSuccess(true); setTimeout(() => setSuccess(false), 3000);
    } catch (err) { alert("Failed to publish."); } finally { setLoading(false); }
  };

  const handleSaveAllSettings = () => {
    if (activeTab === "identity" || activeTab === "financial") handleSaveGlobalSettings();
    else if (activeTab === "framework") handleSaveTimetableConfig();
    else if (activeTab === "allotment") handlePublishTimetable();
  };

  return (
    <div className="animate-fade-in space-y-6 pb-20 w-full">
      
      {/* 🚀 HEADER WITH "SAVE ALL SETTINGS" */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 w-full">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Admin Control Panel</h1>
          <p className="text-sm text-slate-500 mt-1">Configure your school's global structure and identity here.</p>
        </div>
        <button onClick={handleSaveAllSettings} disabled={loading} className="bg-[#3ac47d] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#2eaa6a] transition-all shadow-md disabled:opacity-50 w-full sm:w-auto justify-center">
           {loading ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>} Save All Settings
        </button>
      </div>

      {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-100 font-bold w-full"><CheckCircle2 size={20}/> Action Completed Successfully!</div>}
      {clashError && <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 border border-red-200 font-bold shadow-sm animate-bounce w-full"><AlertCircle size={20}/> {clashError}</div>}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full">
        
        {/* --- SETTINGS SIDEBAR --- */}
        <div className="md:col-span-4 lg:col-span-3 space-y-3 w-full">
           <button onClick={() => setActiveTab("identity")} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === "identity" ? "bg-[#111827] text-white shadow-lg scale-[1.02]" : "bg-white text-slate-500 hover:bg-slate-50 shadow-sm"}`}>
             <Building2 size={22} className={activeTab === "identity" ? "text-[#3ac47d]" : "text-slate-400"} /> 
             <div className="text-left w-full">
                <p className="text-sm">School Identity</p>
                <p className={`text-[9px] uppercase tracking-widest mt-0.5 ${activeTab === "identity" ? "text-slate-400" : "text-slate-400"}`}>Name, Logo & Print Info</p>
             </div>
           </button>
           
           <button onClick={() => setActiveTab("academic")} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === "academic" ? "bg-[#111827] text-white shadow-lg scale-[1.02]" : "bg-white text-slate-500 hover:bg-slate-50 shadow-sm"}`}>
             <Layers size={22} className={activeTab === "academic" ? "text-[#3ac47d]" : "text-slate-400"} /> 
             <div className="text-left w-full">
                <p className="text-sm">Academic Structure</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">Level, Classes & Sections Hub</p>
             </div>
           </button>
           
           <button onClick={() => setActiveTab("financial")} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === "financial" ? "bg-[#111827] text-white shadow-lg scale-[1.02]" : "bg-white text-slate-500 hover:bg-slate-50 shadow-sm"}`}>
             <Wallet size={22} className={activeTab === "financial" ? "text-[#3ac47d]" : "text-slate-400"} /> 
             <div className="text-left w-full">
                <p className="text-sm">Financial Setup</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">Currency & Fee Rules</p>
             </div>
           </button>
           
           <button onClick={() => setActiveTab("security")} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === "security" ? "bg-[#111827] text-white shadow-lg scale-[1.02]" : "bg-white text-slate-500 hover:bg-slate-50 shadow-sm"}`}>
             <ShieldCheck size={22} className={activeTab === "security" ? "text-[#3ac47d]" : "text-slate-400"} /> 
             <div className="text-left w-full">
                <p className="text-sm">System Security</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">Admin Profile & Danger Zone</p>
             </div>
           </button>

           <div className="pt-4 border-t border-slate-200 mt-6 space-y-3 w-full">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2">Timetable Settings</p>
              <button onClick={() => setActiveTab("framework")} className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl font-bold transition-all ${activeTab === "framework" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-white text-slate-500 hover:bg-slate-50 shadow-sm"}`}>
                <Clock size={18} /> <div className="text-left"><p className="text-sm">Global Framework</p></div>
              </button>
              <button onClick={() => setActiveTab("allotment")} className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl font-bold transition-all ${activeTab === "allotment" ? "bg-[#3ac47d] text-white shadow-md" : "bg-white text-slate-500 hover:bg-slate-50 shadow-sm"}`}>
                <CalendarRange size={18} /> <div className="text-left"><p className="text-sm">Timetable Allotment</p></div>
              </button>
           </div>
        </div>

        {/* --- SETTINGS CONTENT --- */}
        <div className="md:col-span-8 lg:col-span-9 w-full">
           
           {/* 1. SCHOOL IDENTITY */}
           {activeTab === "identity" && (
             <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 animate-fade-in-up w-full">
                <h2 className="text-lg font-black text-[#0F172A] flex items-center gap-2 mb-8"><Building2 className="text-blue-500" size={20}/> School Identity</h2>
                <div className="space-y-6 w-full">
                   <div className="space-y-2 w-full">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">School Category</label>
                     <select value={schoolCategory} onChange={e => setSchoolCategory(e.target.value)} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm font-bold text-[#0F172A] border border-slate-200 focus:border-[#3ac47d]">
                        <option>Private School</option><option>Government School</option><option>Semi-Government / Trust</option>
                     </select>
                   </div>
                   <div className="space-y-2 w-full">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registered Name</label>
                     <input type="text" value={registeredName} onChange={e => setRegisteredName(e.target.value)} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm font-bold text-[#0F172A] border border-slate-200 focus:border-[#3ac47d]" />
                   </div>
                   <div className="space-y-2 w-full">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tagline (Auto-Filled for Punjab Govt)</label>
                     <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border border-slate-200 font-medium text-slate-600 focus:border-[#3ac47d]" />
                   </div>
                </div>
             </div>
           )}

           {/* 2. ACADEMIC STRUCTURE */}
           {activeTab === "academic" && (
             <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 animate-fade-in-up w-full">
                <h2 className="text-lg font-black text-[#0F172A] flex items-center gap-2 mb-8"><Layers className="text-purple-500" size={20}/> Academic Structure</h2>
                
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl mb-8 w-full">
                   <h3 className="text-sm font-black text-slate-700 mb-4">Add New Class & Section</h3>
                   <div className="flex flex-col sm:flex-row gap-4 items-end w-full">
                      <div className="w-full space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Class Grade</label>
                         <input type="text" placeholder="e.g. Class 10" value={newClassGrade} onChange={e => setNewClassGrade(e.target.value)} className="w-full bg-white outline-none rounded-xl px-4 py-3 text-sm font-bold border border-slate-200 focus:border-purple-400" />
                      </div>
                      <div className="w-full space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Section Name</label>
                         <input type="text" placeholder="e.g. Iqbal" value={newSectionName} onChange={e => setNewSectionName(e.target.value)} className="w-full bg-white outline-none rounded-xl px-4 py-3 text-sm font-bold border border-slate-200 focus:border-purple-400" />
                      </div>
                      <button onClick={handleAddSection} disabled={loading} className="bg-purple-600 text-white w-full sm:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 shadow-md whitespace-nowrap">
                         {loading ? <Loader2 size={18} className="animate-spin"/> : <PlusCircle size={18}/>} Add Section
                      </button>
                   </div>
                </div>

                <h3 className="text-sm font-black text-slate-700 mb-4">Existing Sections</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                   {sections.length === 0 ? <p className="text-slate-400 font-bold text-sm">No sections created yet.</p> : sections.map(s => (
                      <div key={s.id} className="bg-white border border-slate-200 p-4 rounded-xl flex justify-between items-center group hover:border-purple-300 w-full">
                         <div>
                            <p className="font-black text-[#0F172A]">{s.classGrade}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Section: {s.sectionName}</p>
                         </div>
                         <button onClick={() => handleDeleteSection(s.id)} className="text-red-400 hover:text-red-600 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                      </div>
                   ))}
                </div>
             </div>
           )}

           {/* 3. FINANCIAL SETUP */}
           {activeTab === "financial" && (
             <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 animate-fade-in-up w-full">
                <h2 className="text-lg font-black text-[#0F172A] flex items-center gap-2 mb-8"><Wallet className="text-orange-500" size={20}/> Financial Setup</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                   <div className="space-y-2 w-full">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base Currency</label>
                     <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm font-bold text-[#0F172A] border border-slate-200 focus:border-orange-400">
                        <option value="PKR">Pakistani Rupee (PKR)</option><option value="USD">US Dollar (USD)</option><option value="INR">Indian Rupee (INR)</option>
                     </select>
                   </div>
                   <div className="space-y-2 w-full">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fee Due Date (Every Month)</label>
                     <input type="number" min="1" max="28" value={feeDueDate} onChange={e => setFeeDueDate(e.target.value)} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm font-bold text-[#0F172A] border border-slate-200 focus:border-orange-400" />
                   </div>
                   <div className="space-y-2 w-full">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Late Fee Fine (Per Day)</label>
                     <input type="number" value={lateFine} onChange={e => setLateFine(e.target.value)} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm font-bold text-[#0F172A] border border-slate-200 focus:border-orange-400" />
                   </div>
                </div>
             </div>
           )}

           {/* 4. SYSTEM SECURITY */}
           {activeTab === "security" && (
             <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-red-100 animate-fade-in-up w-full">
                <h2 className="text-lg font-black text-red-600 flex items-center gap-2 mb-8"><ShieldCheck size={20}/> System Security & Admin Profile</h2>
                <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 w-full">
                   <h3 className="font-black mb-2">Danger Zone</h3>
                   <p className="text-sm font-medium mb-6">Changing admin credentials requires re-authentication. Be absolutely certain before making changes.</p>
                   <button className="bg-white text-red-600 border border-red-200 px-6 py-3 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-colors text-sm w-full sm:w-auto">Reset Admin Password</button>
                </div>
             </div>
           )}

           {/* 5. TIMETABLE: FRAMEWORK SETUP */}
           {activeTab === "framework" && (
             <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 animate-fade-in-up w-full">
                <h2 className="text-xl font-black text-[#0F172A] flex items-center gap-2 mb-6"><Clock className="text-blue-500"/> Timetable Framework</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                   <div className="space-y-2 w-full">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Daily Periods</label>
                     <input type="number" value={totalPeriods} onChange={e => setTotalPeriods(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-black text-xl text-[#0F172A] outline-none focus:border-blue-500" />
                   </div>
                   <div className="space-y-2 w-full">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Break / Recess After</label>
                     <select value={breakAfter} onChange={e => setBreakAfter(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-black text-xl text-orange-600 outline-none focus:border-blue-500">
                        {Array.from({length: totalPeriods}, (_, i) => i + 1).map(num => (
                           <option key={num} value={num}>After {getOrdinal(num)} Period</option>
                        ))}
                     </select>
                   </div>
                </div>
             </div>
           )}

           {/* 6. TIMETABLE: SMART ALLOTMENT ENGINE */}
           {activeTab === "allotment" && (
             <div className="space-y-6 animate-fade-in-up w-full">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 w-full">
                   <h2 className="text-lg font-black text-[#0F172A] flex items-center gap-2 mb-6"><CalendarRange className="text-[#3ac47d]"/> Smart Batch Allotment</h2>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 border-b border-slate-100 pb-6 w-full">
                      <div className="space-y-1 w-full"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Class</label><select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSection(""); }} className="w-full bg-slate-50 outline-none rounded-xl px-3 py-3 text-sm border border-slate-200 font-bold focus:border-[#3ac47d]"><option value="">Choose Class</option>{availableClasses.map(cls => <option key={cls as string} value={cls as string}>{cls as string}</option>)}</select></div>
                      <div className="space-y-1 w-full"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Section</label><select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} disabled={!selectedClass} className="w-full bg-slate-50 outline-none rounded-xl px-3 py-3 text-sm border border-slate-200 font-bold focus:border-[#3ac47d] disabled:opacity-50"><option value="">Choose Section</option>{availableSections.map(sec => <option key={sec.id} value={sec.sectionName}>{sec.sectionName}</option>)}</select></div>
                   </div>

                   <div className={`transition-opacity duration-300 w-full ${!selectedClass || !selectedSection ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end w-full">
                         <div className="space-y-1 w-full"><label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Period</label><select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)} className="w-full bg-blue-50 outline-none rounded-lg px-3 py-3 text-xs font-bold text-blue-700"><option value="">Period</option>{schoolPeriods.filter(p => p !== "Break").map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                         <div className="space-y-1 w-full"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</label><select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full bg-slate-50 outline-none rounded-lg px-3 py-3 text-xs font-bold border border-slate-200"><option value="">Subject</option>{availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}<option value="Games">Games / PT</option><option value="Library">Library</option></select></div>
                         <div className="space-y-1 w-full"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Teacher</label><select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)} className="w-full bg-slate-50 outline-none rounded-lg px-3 py-3 text-xs font-bold border border-slate-200"><option value="">Teacher</option>{displayStaff.map(t => <option key={t.id} value={t.id}>{t.personal?.fullName}</option>)}</select></div>
                         <div className="space-y-1 w-full"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Day Range</label><div className="flex items-center gap-1"><select value={fromDay} onChange={e => setFromDay(e.target.value)} className="w-full bg-slate-50 outline-none rounded-lg px-1 py-3 text-[10px] font-bold border border-slate-200">{DAYS.map(d => <option key={d} value={d}>{d.substring(0,3)}</option>)}</select><span className="text-slate-400 font-bold">-</span><select value={toDay} onChange={e => setToDay(e.target.value)} className="w-full bg-slate-50 outline-none rounded-lg px-1 py-3 text-[10px] font-bold border border-slate-200">{DAYS.map(d => <option key={d} value={d}>{d.substring(0,3)}</option>)}</select></div></div>
                         <button onClick={handleBatchAllot} className="bg-[#3ac47d] text-white w-full py-3 rounded-lg font-black text-xs hover:bg-[#2eaa6a] shadow-sm uppercase tracking-widest mt-2 lg:mt-0">Apply</button>
                      </div>
                   </div>
                </div>

                {selectedClass && selectedSection && (
                   <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden w-full">
                      <div className="px-6 py-4 bg-[#0F172A] text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                         <div><h3 className="font-black text-sm uppercase">{selectedClass} - {selectedSection} Preview</h3></div>
                         <button onClick={handlePublishTimetable} disabled={loading} className="bg-white text-[#0F172A] px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-slate-200 transition-colors w-full sm:w-auto justify-center">
                           {loading ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} Publish Routine
                         </button>
                      </div>
                      
                      {/* 🚀 یہ وہ جگہ ہے جس سے موبائل پر ٹیبل دائیں بائیں سوائپ (Swipe) ہوگی */}
                      <div className="p-4 overflow-x-auto w-full">
                         <table className="w-full min-w-[800px] border-collapse text-left">
                            <thead>
                               <tr><th className="bg-slate-100 text-slate-500 font-black uppercase text-[10px] p-3 border border-slate-200">Period</th>{DAYS.map(day => <th key={day} className="bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-[10px] p-3 border border-slate-200 text-center">{day}</th>)}</tr>
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
                                         <td key={key} className="border border-slate-200 p-1.5 text-center relative group h-14 min-w-[110px]">
                                            {cell ? (
                                               <div className="flex flex-col items-center justify-center h-full bg-blue-50/50 rounded-md border border-blue-100 p-1">
                                                  <span className="font-black text-[#0F172A] text-[10px] uppercase">{cell.subject}</span>
                                                  <span className="text-[9px] font-bold text-slate-500 truncate w-full">{cell.teacherName}</span>
                                                  <button onClick={() => handleClearCell(day, period)} className="absolute top-1 right-1 opacity-100 sm:opacity-0 group-hover:opacity-100 bg-red-100 text-red-600 p-1 rounded-md text-[10px]" title="Clear"><Trash2 size={12}/></button>
                                               </div>
                                            ) : <span className="text-[9px] font-bold text-slate-300 uppercase">Empty</span>}
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

        </div>
      </div>
    </div>
  );
}
