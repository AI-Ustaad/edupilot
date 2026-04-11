"use client";
import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../context/AuthContext";
import { 
  Building2, GraduationCap, Wallet, ShieldCheck, 
  CheckCircle2, AlertCircle, Save, Layers, Plus, X, User
} from "lucide-react";

// The Global Academic Rules (Level to Classes Mapping)
const ACADEMIC_MAP = {
  "Primary": ["Nursery", "Prep", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5"],
  "Elementary": ["Nursery", "Prep", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8"],
  "Secondary (High)": ["Nursery", "Prep", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"]
};

export default function SettingsPage() {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [activeTab, setActiveTab] = useState("academic"); // Changed default tab to academic

  // --- GLOBAL SETTINGS STATE ---
  const [settings, setSettings] = useState({
    schoolCategory: "Private School",
    schoolLevel: "Secondary (High)", // NEW: Determines available classes
    schoolName: "",
    schoolAddress: "",
    schoolPhone: "",
    principalName: "",
    currencySymbol: "Rs",
    activeAcademicYear: "2026-2027",
  });

  // --- ACADEMIC STRUCTURE STATE (Classes & Sections) ---
  const [sections, setSections] = useState<any[]>([]);
  const [newClass, setNewClass] = useState(""); // Will be populated based on schoolLevel
  const [newSectionName, setNewSectionName] = useState("");
  const [newIncharge, setNewIncharge] = useState("");

  useEffect(() => {
    setIsMounted(true);
    if (user) {
      const fetchData = async () => {
        // Fetch Settings
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }));
        }
        
        // Fetch Existing Sections
        const querySnapshot = await getDocs(collection(db, "sections"));
        setSections(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      };
      fetchData();
    }
  }, [user]);

  // Set default class when level changes
  useEffect(() => {
    if (settings.schoolLevel) {
      const availableClasses = ACADEMIC_MAP[settings.schoolLevel as keyof typeof ACADEMIC_MAP];
      setNewClass(availableClasses[0]); // Default to first class in list
    }
  }, [settings.schoolLevel]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSaveGlobalSettings = async () => {
    if (!user) return;
    setLoading(true); setErrorMsg(""); setSuccess(false);
    try {
      await setDoc(doc(db, "users", user.uid), {
        ...settings,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setErrorMsg("Failed to save global settings.");
    } finally {
      setLoading(false);
    }
  };

  // --- CREATE NEW SECTION (The Core Hub) ---
  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return setErrorMsg("Section name is required.");
    setLoading(true); setErrorMsg(""); setSuccess(false);
    
    const sectionId = `${newClass}-${newSectionName}`.replace(/\s+/g, '-');
    
    try {
      const sectionData = {
        classGrade: newClass,
        sectionName: newSectionName,
        incharge: newIncharge || "Unassigned",
        createdAt: serverTimestamp()
      };
      
      await setDoc(doc(db, "sections", sectionId), sectionData);
      
      // Update local state instantly
      setSections([...sections, { id: sectionId, ...sectionData }]);
      
      setSuccess(true); setNewSectionName(""); setNewIncharge("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setErrorMsg("Failed to create section.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if(!confirm("Are you sure? This will remove the section from dropdowns.")) return;
    try {
      await deleteDoc(doc(db, "sections", id));
      setSections(sections.filter(s => s.id !== id));
    } catch (error) {
      alert("Failed to delete.");
    }
  }

  if (!isMounted) return null;

  // Available classes based on selected school level
  const dynamicClasses = ACADEMIC_MAP[settings.schoolLevel as keyof typeof ACADEMIC_MAP] || [];

  const TABS = [
    { id: "academic", label: "Academic Structure", icon: Layers, desc: "Level, Classes & Sections Hub" },
    { id: "identity", label: "School Identity", icon: Building2, desc: "Name, Logo & Print Info" },
    { id: "financial", label: "Financial Setup", icon: Wallet, desc: "Currency & Fee Rules" },
    { id: "security", label: "System Security", icon: ShieldCheck, desc: "Admin Profile & Danger Zone" },
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Admin Control Panel</h1>
          <p className="text-sm text-slate-500 mt-1">Configure your school's global structure and identity here.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT SIDEBAR (TABS NAVIGATION) --- */}
        <div className="lg:col-span-3 space-y-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-4 ${
                activeTab === tab.id 
                  ? "bg-[#0F172A] text-white shadow-lg" 
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-100"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activeTab === tab.id ? "bg-white/20 text-[#3ac47d]" : "bg-slate-100 text-slate-400"}`}>
                <tab.icon size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">{tab.label}</p>
                <p className={`text-[10px] mt-0.5 ${activeTab === tab.id ? "text-slate-400" : "text-slate-400"}`}>{tab.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* --- RIGHT PANEL (TAB CONTENT) --- */}
        <div className="lg:col-span-9">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[500px]">
            
            {/* TAB 1: ACADEMIC STRUCTURE (THE ENGINE ROOM) */}
            {activeTab === "academic" && (
              <div className="space-y-8 animate-fade-in-down">
                <div className="border-b border-slate-100 pb-4 flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Layers size={20} className="text-blue-500"/> Academic Registration Engine</h2>
                    <p className="text-sm text-slate-500 mt-1">This structure acts as the 'Single Source of Truth'. Sections created here will appear globally across the SaaS.</p>
                  </div>
                  <button onClick={handleSaveGlobalSettings} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors">
                     Save Global Level
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  
                  {/* STEP 1: Global Level Setting */}
                  <div className="md:col-span-12 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                     <h3 className="text-sm font-bold text-[#0F172A] mb-4">Step 1: Define School Level</h3>
                     <div className="space-y-2">
                        <select name="schoolLevel" value={settings.schoolLevel} onChange={handleInputChange} className="w-full sm:w-1/2 bg-white outline-none rounded-xl px-4 py-3 text-sm border font-black text-blue-600 shadow-sm cursor-pointer focus:border-blue-500">
                          <option value="Primary">Primary School (Nursery to 5th)</option>
                          <option value="Elementary">Elementary School (Nursery to 8th)</option>
                          <option value="Secondary (High)">Secondary / High School (Nursery to 10th)</option>
                        </select>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-2">Changing this will update the class dropdowns below.</p>
                     </div>
                  </div>

                  {/* STEP 2-4: The Section Creator */}
                  <div className="md:col-span-5 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-[#3ac47d]"></div>
                     <h3 className="text-sm font-bold text-[#3ac47d] uppercase tracking-widest mb-6 flex items-center gap-2"><Plus size={16}/> Add New Section</h3>
                     
                     {success && <div className="bg-green-50 text-green-700 p-2 rounded-lg mb-4 text-[10px] font-bold text-center">Section Added!</div>}
                     {errorMsg && <div className="bg-red-50 text-red-600 p-2 rounded-lg mb-4 text-[10px] font-bold text-center">{errorMsg}</div>}

                     <form onSubmit={handleCreateSection} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step 2: Class</label>
                          <select value={newClass} onChange={(e) => setNewClass(e.target.value)} className="w-full bg-slate-50 outline-none rounded-lg px-3 py-2 text-sm border font-bold text-[#0F172A] cursor-pointer">
                            {dynamicClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step 3: Section Name</label>
                          <input required value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} placeholder="e.g. Jinnah, Science, A" className="w-full bg-slate-50 outline-none rounded-lg px-3 py-2 text-sm border font-bold text-[#0F172A]" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step 4: Appoint Incharge</label>
                          <input value={newIncharge} onChange={(e) => setNewIncharge(e.target.value)} placeholder="Teacher's Name" className="w-full bg-slate-50 outline-none rounded-lg px-3 py-2 text-sm border font-medium" />
                        </div>
                        
                        {/* Note about Subjects (Placeholder for future expansion) */}
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
                           <p className="text-[10px] text-blue-600 font-bold">Subjects Configuration</p>
                           <p className="text-[9px] text-blue-500 mt-0.5">Core subjects will be automatically assigned based on the selected class grade.</p>
                        </div>

                        <button disabled={loading} type="submit" className="w-full bg-[#0F172A] text-white py-2.5 rounded-xl text-sm font-bold mt-2 hover:bg-slate-800 transition-colors shadow-md">
                          Publish to System
                        </button>
                     </form>
                  </div>

                  {/* DISPLAY: Currently Configured Sections */}
                  <div className="md:col-span-7">
                     <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><CheckCircle2 size={16} className="text-[#3ac47d]"/> Globally Active Sections</h3>
                     
                     <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden h-[400px] overflow-y-auto">
                        {sections.length === 0 ? (
                           <div className="h-full flex flex-col items-center justify-center opacity-50 p-6 text-center">
                              <Layers size={40} className="mb-2 text-slate-400" />
                              <p className="font-bold text-sm text-slate-500">No sections defined.</p>
                              <p className="text-xs text-slate-400 mt-1">Use the form to build your school's structure.</p>
                           </div>
                        ) : (
                           <div className="divide-y divide-slate-200">
                             {dynamicClasses.map(cls => {
                               const classSections = sections.filter(s => s.classGrade === cls);
                               if(classSections.length === 0) return null; // Don't show empty classes
                               
                               return (
                                 <div key={cls} className="p-4">
                                    <h4 className="font-black text-[#0F172A] text-sm mb-3 bg-white inline-block px-3 py-1 rounded-full shadow-sm border border-slate-100">{cls}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2">
                                       {classSections.map(sec => (
                                          <div key={sec.id} className="bg-white border border-slate-200 rounded-xl p-3 flex justify-between items-center group hover:border-[#3ac47d] transition-colors shadow-sm">
                                             <div>
                                                <p className="text-xs font-bold text-[#0F172A]">Sec: {sec.sectionName}</p>
                                                <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5"><User size={10}/> {sec.incharge}</p>
                                             </div>
                                             <button onClick={() => handleDeleteSection(sec.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                                <X size={14} />
                                             </button>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                               );
                             })}
                           </div>
                        )}
                     </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 2: IDENTITY (Placeholder for previous Settings UI) */}
            {activeTab === "identity" && (
               <div className="space-y-6 animate-fade-in-down">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-bold text-slate-800">School Identity</h2>
                    <p className="text-sm text-slate-500 mt-1">Name, address, and branding information.</p>
                  </div>
                  {/* Put your previous schoolName, address, logo inputs here */}
                  <div className="p-10 text-center opacity-50 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                     <Building2 size={40} className="mx-auto mb-3" />
                     <p className="font-bold">Identity Module Loaded</p>
                  </div>
               </div>
            )}

            {/* TAB 3 & 4 (Placeholders) */}
            {activeTab === "financial" && (
               <div className="space-y-6 animate-fade-in-down">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-bold text-slate-800">Financial Rules</h2>
                    <p className="text-sm text-slate-500 mt-1">Configure currency and global fee policies.</p>
                  </div>
                  <div className="p-10 text-center opacity-50 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                     <Wallet size={40} className="mx-auto mb-3" />
                     <p className="font-bold">Financial Module Loaded</p>
                  </div>
               </div>
            )}

            {activeTab === "security" && (
               <div className="space-y-6 animate-fade-in-down">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-bold text-slate-800">System Security</h2>
                    <p className="text-sm text-slate-500 mt-1">Admin access and database management.</p>
                  </div>
                  <div className="p-10 text-center opacity-50 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                     <ShieldCheck size={40} className="mx-auto mb-3" />
                     <p className="font-bold">Security Module Loaded</p>
                  </div>
               </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
