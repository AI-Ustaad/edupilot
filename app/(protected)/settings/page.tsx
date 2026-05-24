"use client";

import React, { useState, useEffect } from "react";
import { Settings, BookOpen, Layers, Clock, CheckCircle2, Loader2, Plus, Trash2, ShieldCheck, Palette, Monitor } from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import Link from "next/link";

export default function AdminSettingsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState("classes");

  const [classes, setClasses] = useState<string[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);

  const [newClass, setNewClass] = useState("");
  const [newSectionClass, setNewSectionClass] = useState("");
  const [newSectionName, setNewSectionName] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newPeriod, setNewPeriod] = useState({ name: "", startTime: "", endTime: "" });

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setClasses(data.classes || []);
        setSections(data.sections || []);
        setSubjects(data.subjects || []);
        setPeriods(data.periods || []);
      }
    } catch (err) {
      console.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchConfig();
  }, []);

  const saveConfig = async () => {
    setSaving(true);
    setSuccessMsg("");
    try {
      const payload = { classes, sections, subjects, periods };
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (res.ok) {
        setSuccessMsg("System configuration updated successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        throw new Error("Save failed");
      }
    } catch (err) {
      alert("Failed to save settings. Ensure you are an Admin.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddClass = () => {
    if (newClass && !classes.includes(newClass.toUpperCase())) {
      setClasses([...classes, newClass.toUpperCase()]);
      setNewClass("");
    }
  };

  const handleAddSection = () => {
    if (newSectionClass && newSectionName) {
      setSections([...sections, { classGrade: newSectionClass.toUpperCase(), sectionName: newSectionName.toUpperCase(), incharge: "" }]);
      setNewSectionName("");
    }
  };

  const handleAddSubject = () => {
    if (newSubject && !subjects.includes(newSubject.toUpperCase())) {
      setSubjects([...subjects, newSubject.toUpperCase()]);
      setNewSubject("");
    }
  };

  const handleAddPeriod = () => {
    if (newPeriod.name && newPeriod.startTime && newPeriod.endTime) {
      setPeriods([...periods, { ...newPeriod }]);
      setNewPeriod({ name: "", startTime: "", endTime: "" });
    }
  };

  const removeClass = (val: string) => {
    setClasses(classes.filter(c => c !== val));
    setSections(sections.filter(s => s.classGrade !== val));
  };
  const removeSection = (idx: number) => setSections(sections.filter((_, i) => i !== idx));
  const removeSubject = (val: string) => setSubjects(subjects.filter(s => s !== val));
  const removePeriod = (idx: number) => setPeriods(periods.filter((_, i) => i !== idx));

  if (!isMounted) return null;

  return (
    <div className="animate-fade-in space-y-6 pb-20 w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight uppercase flex items-center gap-3">
            <Settings className="text-blue-500" size={32}/> System Configuration
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-bold flex items-center gap-2">
            <ShieldCheck size={16} className="text-green-500"/> Tenant Administrator Control Panel
          </p>
        </div>
        <button onClick={saveConfig} disabled={saving || loading} className="bg-[#0F172A] text-white px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg disabled:opacity-50">
          {saving ? <><Loader2 size={18} className="animate-spin"/> Syncing...</> : <><CheckCircle2 size={18}/> Publish Changes</>}
        </button>
      </div>

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-100 font-black uppercase tracking-widest animate-fade-in-down shadow-sm">
          <CheckCircle2 size={20}/> {successMsg}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center"><Loader2 size={40} className="animate-spin mx-auto text-blue-500 mb-4"/><p className="font-bold text-slate-400 uppercase tracking-widest">Loading Configuration...</p></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Sidebar Navigation - Now with separate School Branding and Dashboard Themes tabs */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col gap-2">
            {[
              { id: "classes", icon: <Layers size={18}/>, label: "Classes & Sections" },
              { id: "subjects", icon: <BookOpen size={18}/>, label: "Academic Subjects" },
              { id: "periods", icon: <Clock size={18}/>, label: "Time Table Periods" },
              { id: "branding", icon: <Monitor size={18}/>, label: "School Branding" },
              { id: "themes", icon: <Palette size={18}/>, label: "Dashboard Themes" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id ? "bg-blue-50 text-blue-600 border border-blue-100" : "text-slate-500 hover:bg-slate-50 border border-transparent"}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-10 min-h-[500px]">
            {/* CLASSES & SECTIONS TAB */}
            {activeTab === "classes" && (
              <div className="space-y-10 animate-fade-in">
                <section>
                  <h2 className="text-lg font-black text-[#0F172A] uppercase mb-4 border-b pb-2">Master Classes</h2>
                  <div className="flex gap-2 mb-6">
                    <input value={newClass} onChange={e => setNewClass(e.target.value)} placeholder="e.g. CLASS 10" className="flex-1 bg-slate-50 border border-slate-200 outline-none rounded-xl px-4 py-3 font-bold uppercase focus:border-blue-500"/>
                    <button onClick={handleAddClass} className="bg-slate-800 text-white px-4 py-3 rounded-xl font-bold hover:bg-slate-700"><Plus size={20}/></button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {classes.length === 0 ? <p className="text-sm font-bold text-slate-400">No classes configured.</p> : classes.map(c => (
                      <div key={c} className="bg-slate-100 px-4 py-2 rounded-lg flex items-center gap-3 border border-slate-200">
                        <span className="font-black text-[#0F172A] uppercase text-sm">{c}</span>
                        <button onClick={() => removeClass(c)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-black text-[#0F172A] uppercase mb-4 border-b pb-2">Sections Allocation</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-6">
                    <select value={newSectionClass} onChange={e => setNewSectionClass(e.target.value)} className="sm:col-span-2 bg-slate-50 border border-slate-200 outline-none rounded-xl px-4 py-3 font-bold uppercase focus:border-blue-500">
                      <option value="">Select Class</option>{classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input value={newSectionName} onChange={e => setNewSectionName(e.target.value)} placeholder="Section (e.g. A)" className="sm:col-span-2 bg-slate-50 border border-slate-200 outline-none rounded-xl px-4 py-3 font-bold uppercase focus:border-blue-500"/>
                    <button onClick={handleAddSection} disabled={!newSectionClass} className="sm:col-span-1 bg-slate-800 text-white py-3 rounded-xl font-bold flex justify-center disabled:opacity-50"><Plus size={20}/></button>
                  </div>
                  <div className="space-y-2">
                    {sections.length === 0 ? <p className="text-sm font-bold text-slate-400">No sections allocated.</p> : sections.map((s, i) => (
                      <div key={i} className="bg-white p-3 rounded-xl flex justify-between items-center border border-slate-200 shadow-sm">
                        <p className="font-black text-sm uppercase"><span className="text-slate-400 mr-2">Class:</span> {s.classGrade} <span className="text-slate-400 mx-2">| Section:</span> <span className="text-blue-600">{s.sectionName}</span></p>
                        <button onClick={() => removeSection(i)} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 size={16}/></button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* SUBJECTS TAB */}
            {activeTab === "subjects" && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-black text-[#0F172A] uppercase mb-4 border-b pb-2">Academic Subjects</h2>
                <div className="flex gap-2 mb-6">
                  <input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="e.g. MATHEMATICS" className="flex-1 bg-slate-50 border border-slate-200 outline-none rounded-xl px-4 py-3 font-bold uppercase focus:border-blue-500"/>
                  <button onClick={handleAddSubject} className="bg-slate-800 text-white px-4 py-3 rounded-xl font-bold hover:bg-slate-700"><Plus size={20}/></button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {subjects.length === 0 ? <p className="text-sm font-bold text-slate-400">No subjects configured.</p> : subjects.map(s => (
                    <div key={s} className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg flex items-center gap-3 border border-purple-100">
                      <span className="font-black uppercase text-sm">{s}</span>
                      <button onClick={() => removeSubject(s)} className="text-purple-400 hover:text-purple-600"><Trash2 size={14}/></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TIME TABLE PERIODS TAB */}
            {activeTab === "periods" && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-black text-[#0F172A] uppercase mb-4 border-b pb-2">Daily Bell Schedule</h2>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 px-1">Period Name</label><input value={newPeriod.name} onChange={e => setNewPeriod({...newPeriod, name: e.target.value})} placeholder="1st Period / Break" className="w-full bg-white border border-slate-200 outline-none rounded-xl px-4 py-2.5 font-bold uppercase focus:border-blue-500"/></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 px-1">Start Time</label><input type="time" value={newPeriod.startTime} onChange={e => setNewPeriod({...newPeriod, startTime: e.target.value})} className="w-full bg-white border border-slate-200 outline-none rounded-xl px-4 py-2.5 font-bold focus:border-blue-500"/></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 px-1">End Time</label><input type="time" value={newPeriod.endTime} onChange={e => setNewPeriod({...newPeriod, endTime: e.target.value})} className="w-full bg-white border border-slate-200 outline-none rounded-xl px-4 py-2.5 font-bold focus:border-blue-500"/></div>
                  <div className="flex items-end"><button onClick={handleAddPeriod} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold flex justify-center gap-2 uppercase tracking-widest hover:bg-blue-700 shadow-sm"><Plus size={18}/> Add</button></div>
                </div>
                <div className="space-y-2">
                  {periods.length === 0 ? <p className="text-sm font-bold text-slate-400 text-center py-10">No bell schedule configured.</p> : periods.map((p, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl flex justify-between items-center border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                      <div className="flex items-center gap-6">
                        <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-black flex items-center justify-center text-xs">{i+1}</span>
                        <div><p className="font-black text-[#0F172A] uppercase">{p.name}</p><p className="text-xs font-bold text-slate-500 mt-0.5"><Clock size={12} className="inline mr-1"/> {p.startTime} - {p.endTime}</p></div>
                      </div>
                      <button onClick={() => removePeriod(i)} className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCHOOL BRANDING TAB - White Label Settings only */}
            {activeTab === "branding" && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-black text-[#0F172A] uppercase mb-4 border-b pb-2 flex items-center gap-2">
                  <Monitor size={20} /> School Branding
                </h2>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl">
                  <Link href="/settings/whitelabel" className="inline-flex items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-700 transition">
                    Manage White Label Settings →
                  </Link>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
                    Customize your school's logo, favicon, name, and primary color. These changes will appear across the entire system.
                  </p>
                </div>
              </div>
            )}

            {/* DASHBOARD THEMES TAB - Theme Switcher only */}
            {activeTab === "themes" && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-black text-[#0F172A] uppercase mb-4 border-b pb-2 flex items-center gap-2">
                  <Palette size={20} /> Dashboard Themes
                </h2>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl">
                  <ThemeSwitcher />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
                    Choose a color theme that matches your school's style. Changes apply instantly.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
