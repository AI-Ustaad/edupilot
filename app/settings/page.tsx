"use client";
import React, { useState, useEffect } from "react";
import { doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Building2, Layers, Wallet, ShieldCheck, Clock, Save, CheckCircle2, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("timetable");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Timetable Settings State
  const [totalPeriods, setTotalPeriods] = useState(8);
  const [breakAfter, setBreakAfter] = useState(4);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "timetableConfig"), (docSnap) => {
      if (docSnap.exists()) {
        setTotalPeriods(docSnap.data().totalPeriods || 8);
        setBreakAfter(docSnap.data().breakAfter || 4);
      }
    });
    return () => unsub();
  }, []);

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
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
    } catch (err) { alert("Failed to save."); } finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Admin Control Panel</h1>
        <p className="text-sm text-slate-500 mt-1">Configure your school's global structure and identity here.</p>
      </div>

      {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-100 font-bold"><CheckCircle2 size={20}/> Settings Saved Successfully!</div>}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* SETTINGS SIDEBAR */}
        <div className="md:col-span-4 lg:col-span-3 space-y-2">
           <button onClick={() => setActiveTab("identity")} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all ${activeTab === "identity" ? "bg-[#0F172A] text-white shadow-md" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"}`}>
             <Building2 size={18} className={activeTab === "identity" ? "text-[#3ac47d]" : ""} /> <div className="text-left"><p>School Identity</p><p className="text-[9px] opacity-70 uppercase tracking-widest">Name, Logo & Print Info</p></div>
           </button>
           <button onClick={() => setActiveTab("academic")} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all ${activeTab === "academic" ? "bg-[#0F172A] text-white shadow-md" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"}`}>
             <Layers size={18} className={activeTab === "academic" ? "text-[#3ac47d]" : ""} /> <div className="text-left"><p>Academic Structure</p><p className="text-[9px] opacity-70 uppercase tracking-widest">Classes & Sections Hub</p></div>
           </button>
           <button onClick={() => setActiveTab("financial")} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all ${activeTab === "financial" ? "bg-[#0F172A] text-white shadow-md" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"}`}>
             <Wallet size={18} className={activeTab === "financial" ? "text-[#3ac47d]" : ""} /> <div className="text-left"><p>Financial Setup</p><p className="text-[9px] opacity-70 uppercase tracking-widest">Currency & Fee Rules</p></div>
           </button>
           <button onClick={() => setActiveTab("timetable")} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all ${activeTab === "timetable" ? "bg-[#0F172A] text-white shadow-md" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"}`}>
             <Clock size={18} className={activeTab === "timetable" ? "text-[#3ac47d]" : ""} /> <div className="text-left"><p>Timetable Framework</p><p className="text-[9px] opacity-70 uppercase tracking-widest">Periods & Break Rules</p></div>
           </button>
        </div>

        {/* SETTINGS CONTENT */}
        <div className="md:col-span-8 lg:col-span-9">
           {activeTab === "timetable" && (
             <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
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
                <button onClick={handleSaveTimetableConfig} disabled={loading} className="bg-[#3ac47d] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#2eaa6a] transition-all shadow-md disabled:opacity-50">
                  {loading ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>} Save Framework
                </button>
             </div>
           )}
           {activeTab !== "timetable" && (
             <div className="bg-white rounded-3xl p-20 shadow-sm border border-slate-100 text-center text-slate-400 font-bold flex flex-col items-center">
                <ShieldCheck size={48} className="mb-4 opacity-50"/>
                This module is under construction. Select "Timetable Framework" to proceed.
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
