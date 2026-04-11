"use client";
import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../context/AuthContext";
import { 
  Building2, Wallet, ShieldCheck, CheckCircle2, AlertCircle, Save, 
  Layers, Plus, X, User, Image as ImageIcon, PenTool
} from "lucide-react";

const ACADEMIC_MAP = {
  "Primary": ["Nursery", "Prep", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5"],
  "Elementary": ["Nursery", "Prep", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8"],
  "Secondary (High)": ["Nursery", "Prep", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"]
};

const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => resolve(fileReader.result as string);
    fileReader.onerror = (error) => reject(error);
  });
};

export default function SettingsPage() {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [activeTab, setActiveTab] = useState("academic");

  const [settings, setSettings] = useState({
    schoolCategory: "Private School",
    schoolLevel: "Secondary (High)",
    schoolName: "",
    tagline: "",
    schoolAddress: "",
    schoolPhone: "",
    principalName: "",
    schoolLogo: "",
    principalSignature: "",
    currencySymbol: "Rs",
    bankName: "",
    accountTitle: "",
    accountNumber: "",
    feeInstructions: "Please pay the fee before the 10th of every month.",
    adminName: "Principal / Admin",
    adminPhone: "",
    adminPhoto: ""
  });

  const [sections, setSections] = useState<any[]>([]);
  const [newClass, setNewClass] = useState(""); 
  const [newSectionName, setNewSectionName] = useState("");
  const [newIncharge, setNewIncharge] = useState("");

  useEffect(() => {
    setIsMounted(true);
    if (user) {
      const fetchData = async () => {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }));
        }
        const querySnapshot = await getDocs(collection(db, "sections"));
        setSections(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      };
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (settings.schoolLevel) {
      const availableClasses = ACADEMIC_MAP[settings.schoolLevel as keyof typeof ACADEMIC_MAP];
      setNewClass(availableClasses[0]);
    }
  }, [settings.schoolLevel]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) return setErrorMsg("Image too large! Max 500KB.");
      setErrorMsg("");
      const base64 = await convertToBase64(file);
      setSettings(prev => ({ ...prev, [fieldName]: base64 }));
    }
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
      setErrorMsg("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return setErrorMsg("Section name is required.");
    setLoading(true); setErrorMsg(""); setSuccess(false);
    const sectionId = `${newClass}-${newSectionName}`.replace(/\s+/g, '-');
    try {
      const sectionData = { classGrade: newClass, sectionName: newSectionName, incharge: newIncharge || "Unassigned", createdAt: serverTimestamp() };
      await setDoc(doc(db, "sections", sectionId), sectionData);
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
        <button onClick={handleSaveGlobalSettings} disabled={loading} className="bg-[#3ac47d] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md hover:bg-[#2eaa6a] transition-all disabled:opacity-50">
          {loading ? "Saving..." : <><Save size={18}/> Save All Settings</>}
        </button>
      </div>

      {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-100"><CheckCircle2 size={20}/> Changes saved successfully!</div>}
      {errorMsg && <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100"><AlertCircle size={20}/> {errorMsg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* --- LEFT SIDEBAR (TABS) --- */}
        <div className="lg:col-span-3 space-y-2">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-4 ${activeTab === tab.id ? "bg-[#0F172A] text-white shadow-lg" : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-100"}`}>
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
            
            {/* TAB 1: ACADEMIC */}
            {activeTab === "academic" && (
              <div className="space-y-8 animate-fade-in-down">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Layers size={20} className="text-blue-500"/> Academic Registration Engine</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  <div className="md:col-span-12 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                     <h3 className="text-sm font-bold text-[#0F172A] mb-4">Step 1: Define School Level</h3>
                     <select name="schoolLevel" value={settings.schoolLevel} onChange={handleInputChange} className="w-full sm:w-1/2 bg-white outline-none rounded-xl px-4 py-3 text-sm border font-black text-blue-600 shadow-sm">
                       <option value="Primary">Primary School (Nursery to 5th)</option>
                       <option value="Elementary">Elementary School (Nursery to 8th)</option>
                       <option value="Secondary (High)">Secondary / High School (Nursery to 10th)</option>
                     </select>
                  </div>
                  <div className="md:col-span-5 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-[#3ac47d]"></div>
                     <h3 className="text-sm font-bold text-[#3ac47d] uppercase tracking-widest mb-6 flex items-center gap-2"><Plus size={16}/> Add New Section</h3>
                     <form onSubmit={handleCreateSection} className="space-y-4">
                        <select value={newClass} onChange={(e) => setNewClass(e.target.value)} className="w-full bg-slate-50 outline-none rounded-lg px-3 py-2 text-sm border font-bold text-[#0F172A]">
                          {dynamicClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                        </select>
                        <input required value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} placeholder="Section Name (e.g. Jinnah)" className="w-full bg-slate-50 outline-none rounded-lg px-3 py-2 text-sm border font-bold" />
                        <input value={newIncharge} onChange={(e) => setNewIncharge(e.target.value)} placeholder="Incharge Name" className="w-full bg-slate-50 outline-none rounded-lg px-3 py-2 text-sm border font-medium" />
                        <button disabled={loading} type="submit" className="w-full bg-[#0F172A] text-white py-2.5 rounded-xl text-sm font-bold mt-2 hover:bg-slate-800 transition-colors shadow-md">Publish to System</button>
                     </form>
                  </div>
                  <div className="md:col-span-7">
                     <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><CheckCircle2 size={16} className="text-[#3ac47d]"/> Globally Active Sections</h3>
                     <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden h-[300px] overflow-y-auto p-4">
                        <div className="divide-y divide-slate-200">
                          {dynamicClasses.map(cls => {
                            const classSections = sections.filter(s => s.classGrade === cls);
                            if(classSections.length === 0) return null;
                            return (
                              <div key={cls} className="py-3">
                                 <h4 className="font-black text-[#0F172A] text-sm mb-2">{cls}</h4>
                                 <div className="grid grid-cols-1 gap-2 pl-2">
                                    {classSections.map(sec => (
                                       <div key={sec.id} className="bg-white border border-slate-200 rounded-lg p-2 flex justify-between items-center group shadow-sm">
                                          <div><p className="text-xs font-bold">Sec: {sec.sectionName}</p><p className="text-[10px] text-slate-500">{sec.incharge}</p></div>
                                          <button onClick={() => handleDeleteSection(sec.id)} className="text-red-500 opacity-0 group-hover:opacity-100"><X size={14}/></button>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                            );
                          })}
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: IDENTITY */}
            {activeTab === "identity" && (
              <div className="space-y-8 animate-fade-in-down">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-800">School Identity</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">School Category</label>
                    <select name="schoolCategory" value={settings.schoolCategory} onChange={handleInputChange} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border font-medium">
                      <option>Private School</option><option>Government School</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Registered Name</label>
                    <input name="schoolName" value={settings.schoolName} onChange={handleInputChange} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border font-bold" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Tagline</label>
                    <input name="tagline" value={settings.tagline} onChange={handleInputChange} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Address</label>
                    <input name="schoolAddress" value={settings.schoolAddress} onChange={handleInputChange} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><ImageIcon size={14}/> School Logo</label>
                    <div className="relative border-2 border-dashed rounded-2xl p-4 bg-slate-50 flex items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-full border overflow-hidden flex items-center justify-center">
                        {settings.schoolLogo ? <img src={settings.schoolLogo} className="w-full h-full object-cover"/> : <Building2 className="text-slate-300"/>}
                      </div>
                      <input type="file" onChange={(e) => handleImageUpload(e, "schoolLogo")} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <p className="text-sm font-bold text-slate-700">Upload Logo</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><PenTool size={14}/> Principal Signature</label>
                    <div className="relative border-2 border-dashed rounded-2xl p-4 bg-slate-50 flex items-center gap-4">
                      <div className="w-24 h-16 bg-white rounded-lg border flex items-center justify-center p-1">
                        {settings.principalSignature ? <img src={settings.principalSignature} className="w-full h-full object-contain"/> : <PenTool className="text-slate-300"/>}
                      </div>
                      <input type="file" onChange={(e) => handleImageUpload(e, "principalSignature")} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <p className="text-sm font-bold text-slate-700">Upload Signature</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: FINANCIAL */}
            {activeTab === "financial" && (
              <div className="space-y-8 animate-fade-in-down">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-800">Financial Rules</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Currency</label>
                    <select name="currencySymbol" value={settings.currencySymbol} onChange={handleInputChange} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border font-bold">
                      <option value="Rs">PKR (Rs)</option><option value="$">USD ($)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Bank Name</label>
                    <input name="bankName" value={settings.bankName} onChange={handleInputChange} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Account Title</label>
                    <input name="accountTitle" value={settings.accountTitle} onChange={handleInputChange} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Account Number</label>
                    <input name="accountNumber" value={settings.accountNumber} onChange={handleInputChange} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Fee Instructions</label>
                    <textarea name="feeInstructions" value={settings.feeInstructions} onChange={handleInputChange} rows={3} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border"></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SECURITY */}
            {activeTab === "security" && (
              <div className="space-y-8 animate-fade-in-down">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-800">System Security</h2>
                </div>
                <div className="flex items-center gap-6 mb-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="w-20 h-20 bg-white rounded-full border-2 overflow-hidden flex items-center justify-center relative group">
                    {settings.adminPhoto ? <img src={settings.adminPhoto} className="w-full h-full object-cover"/> : <User size={32} className="text-slate-300"/>}
                    <input type="file" onChange={(e) => handleImageUpload(e, "adminPhoto")} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <div><h3 className="font-bold text-slate-800">Admin Photo</h3><p className="text-xs text-slate-500">Update dashboard avatar.</p></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Admin Name</label>
                    <input name="adminName" value={settings.adminName} onChange={handleInputChange} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Admin Phone</label>
                    <input name="adminPhone" value={settings.adminPhone} onChange={handleInputChange} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
