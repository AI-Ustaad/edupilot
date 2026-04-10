"use client";
import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../context/AuthContext";
import { 
  Building2, GraduationCap, Wallet, ShieldCheck, 
  CheckCircle2, AlertCircle, Save, Image as ImageIcon, 
  PenTool, MonitorSmartphone, Banknote
} from "lucide-react";

// Helper for Base64 Image Conversion
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
  
  const [activeTab, setActiveTab] = useState("branding");

  // --- GLOBAL SETTINGS STATE ---
  const [settings, setSettings] = useState({
    // Tab 1: Branding
    schoolCategory: "Private School",
    schoolName: "",
    tagline: "",
    schoolAddress: "",
    schoolPhone: "",
    principalName: "",
    schoolLogo: "",
    principalSignature: "",
    
    // Tab 2: Academic
    activeAcademicYear: "2026-2027",
    gradingSystem: "IBCC 2026 (10-Point Scale)",
    resultCardNote: "System Generated Report Card - Aligned with IBCC 2026 Standards",
    
    // Tab 3: Financial
    currencySymbol: "Rs",
    bankName: "",
    accountTitle: "",
    accountNumber: "",
    feeInstructions: "Please pay the fee before the 10th of every month to avoid late fines.",
    
    // Tab 4: Admin Profile (Read-only email from Auth)
    adminName: "Principal / Admin",
    adminPhone: ""
  });

  // Fetch Existing Settings on Mount
  useEffect(() => {
    setIsMounted(true);
    if (user) {
      const fetchSettings = async () => {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }));
        }
      };
      fetchSettings();
    }
  }, [user]);

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

  const handleSaveSettings = async () => {
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
      setErrorMsg("Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  // Tabs Configuration
  const TABS = [
    { id: "branding", label: "School Branding", icon: Building2, desc: "Logos, Signatures & Headers" },
    { id: "academic", label: "Academic Config", icon: GraduationCap, desc: "Terms, Years & Grading" },
    { id: "financial", label: "Financial Setup", icon: Wallet, desc: "Currency & Bank Details" },
    { id: "security", label: "Admin Profile", icon: ShieldCheck, desc: "Account & Security" },
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Global Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Central Command Center for your EduPilot SaaS.</p>
        </div>
        <button 
          onClick={handleSaveSettings} 
          disabled={loading}
          className="bg-[#3ac47d] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md hover:bg-[#2eaa6a] transition-all disabled:opacity-50"
        >
          {loading ? "Saving..." : <><Save size={18}/> Save Changes</>}
        </button>
      </div>

      {/* Notifications */}
      {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-100"><CheckCircle2 size={20}/> All settings saved successfully! They will now reflect across the system.</div>}
      {errorMsg && <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100"><AlertCircle size={20}/> {errorMsg}</div>}

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
            
            {/* TAB 1: BRANDING */}
            {activeTab === "branding" && (
              <div className="space-y-8 animate-fade-in-down">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><MonitorSmartphone size={20} className="text-[#3ac47d]"/> School Identity & Print Headers</h2>
                  <p className="text-sm text-slate-500 mt-1">These details will automatically appear on all official Result Cards and Fee Vouchers.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">School Category</label>
                    <select name="schoolCategory" value={settings.schoolCategory} onChange={handleInputChange} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border font-medium text-slate-700">
                      <option>Private School</option><option>Government School</option><option>Academy / Institute</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Registered School Name</label>
                    <input name="schoolName" value={settings.schoolName} onChange={handleInputChange} placeholder="e.g. EduPilot High School" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border font-bold text-[#0F172A]" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Tagline / Subtitle</label>
                    <input name="tagline" value={settings.tagline} onChange={handleInputChange} placeholder="e.g. A Project of Education Foundation" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Official Campus Address</label>
                    <input name="schoolAddress" value={settings.schoolAddress} onChange={handleInputChange} placeholder="Main Campus, City, Country" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Contact Number</label>
                    <input name="schoolPhone" value={settings.schoolPhone} onChange={handleInputChange} placeholder="+92 300 0000000" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Principal Name</label>
                    <input name="principalName" value={settings.principalName} onChange={handleInputChange} placeholder="Name of Head" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                  </div>
                </div>

                {/* Images Upload Area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><ImageIcon size={14}/> Official School Logo</label>
                    <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 hover:border-[#3ac47d] transition-colors flex items-center gap-4 bg-slate-50">
                      <div className="w-16 h-16 bg-white rounded-full border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                        {settings.schoolLogo ? <img src={settings.schoolLogo} className="w-full h-full object-cover"/> : <Building2 className="text-slate-300"/>}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-700">Upload Logo</p>
                        <p className="text-[10px] text-slate-400">PNG/JPG (Max 500KB)</p>
                      </div>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "schoolLogo")} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><PenTool size={14}/> Principal Signature</label>
                    <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 hover:border-[#3ac47d] transition-colors flex items-center gap-4 bg-slate-50">
                      <div className="w-24 h-16 bg-white rounded-lg border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-sm p-1">
                        {settings.principalSignature ? <img src={settings.principalSignature} className="w-full h-full object-contain"/> : <PenTool className="text-slate-300"/>}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-700">Upload Signature</p>
                        <p className="text-[10px] text-slate-400">Transparent PNG recommended</p>
                      </div>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "principalSignature")} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACADEMIC */}
            {activeTab === "academic" && (
              <div className="space-y-8 animate-fade-in-down">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><GraduationCap size={20} className="text-[#3ac47d]"/> Academic & Grading Setup</h2>
                  <p className="text-sm text-slate-500 mt-1">Configure how exams and academic years are processed across the system.</p>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Active Academic Year</label>
                    <select name="activeAcademicYear" value={settings.activeAcademicYear} onChange={handleInputChange} className="w-full sm:w-1/2 bg-[#f0fdf4] outline-none rounded-xl px-4 py-3 text-sm border border-green-200 font-bold text-green-700">
                      <option>2025-2026</option><option>2026-2027</option><option>2027-2028</option>
                    </select>
                    <p className="text-[10px] text-slate-400">All new admissions and fees will be tagged to this year.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Grading Standard</label>
                    <select name="gradingSystem" value={settings.gradingSystem} onChange={handleInputChange} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border font-medium text-[#0F172A]">
                      <option>IBCC 2026 (10-Point Scale | 40% Passing)</option>
                      <option>Old System (7-Point Scale | 33% Passing)</option>
                    </select>
                    <p className="text-[10px] text-slate-400">Controls the logic used in the Marks Engine.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Result Card Footer Note</label>
                    <input name="resultCardNote" value={settings.resultCardNote} onChange={handleInputChange} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: FINANCIAL */}
            {activeTab === "financial" && (
              <div className="space-y-8 animate-fade-in-down">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Banknote size={20} className="text-[#3ac47d]"/> Financial & Bank Details</h2>
                  <p className="text-sm text-slate-500 mt-1">Set currency and bank details for automated Fee Vouchers.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Default Currency</label>
                    <select name="currencySymbol" value={settings.currencySymbol} onChange={handleInputChange} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border font-bold text-[#0F172A]">
                      <option value="Rs">PKR (Rs)</option><option value="$">USD ($)</option><option value="£">GBP (£)</option><option value="€">EUR (€)</option><option value="AED">AED</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Bank Name</label>
                    <input name="bankName" value={settings.bankName} onChange={handleInputChange} placeholder="e.g. Meezan Bank" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Account Title</label>
                    <input name="accountTitle" value={settings.accountTitle} onChange={handleInputChange} placeholder="e.g. EduPilot School Trust" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Account Number / IBAN</label>
                    <input name="accountNumber" value={settings.accountNumber} onChange={handleInputChange} placeholder="PK00 MEEZ 000..." className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Fee Voucher Instructions (Printed at bottom)</label>
                    <textarea name="feeInstructions" value={settings.feeInstructions} onChange={handleInputChange} rows={3} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border resize-none"></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SECURITY / PROFILE */}
            {activeTab === "security" && (
              <div className="space-y-8 animate-fade-in-down">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><ShieldCheck size={20} className="text-[#3ac47d]"/> Admin Profile & Security</h2>
                  <p className="text-sm text-slate-500 mt-1">Manage your personal admin account access.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Admin Name</label>
                    <input name="adminName" value={settings.adminName} onChange={handleInputChange} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Admin Phone</label>
                    <input name="adminPhone" value={settings.adminPhone} onChange={handleInputChange} placeholder="+92..." className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Registered Email (Read Only)</label>
                    <input value={user?.email || ""} disabled className="w-full bg-slate-100 outline-none rounded-xl px-4 py-3 text-sm border text-slate-500 cursor-not-allowed" />
                    <p className="text-[10px] text-slate-400">Email cannot be changed from this panel. Please contact support.</p>
                  </div>
                </div>
                
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 mt-8">
                  <h3 className="text-red-700 font-bold text-sm mb-2">Danger Zone</h3>
                  <p className="text-xs text-red-500 mb-4">Erasing database records or resetting the academic year will result in permanent data loss.</p>
                  <button className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors">Factory Reset Data</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
