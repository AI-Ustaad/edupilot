"use client";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link"; // <-- LINK IMPORTED HERE
import { 
  Users, Zap, Upload, Building2, Wallet, 
  PlusCircle, Trash2, Save, CheckCircle2, AlertCircle, 
  GraduationCap, Briefcase, FileText, FileCheck, Loader2
} from "lucide-react";

// Helper for File Uploads
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => resolve(fileReader.result as string);
    fileReader.onerror = (error) => reject(error);
  });
};

const EDU_LEVELS = ["Matriculation", "Intermediate (FA/FSc)", "Bachelors (BA/BSc)", "Masters (MA/MSc)", "M.Phil", "Ph.D", "B.Ed", "M.Ed", "Diploma", "Other"];

export default function ManageStaffPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState("personal");

  // --- COMPREHENSIVE STATE MANAGEMENT ---
  const [personal, setPersonal] = useState({ fullName: "", fatherName: "", cnic: "", dob: "", gender: "Male", maritalStatus: "Single", email: "", phone: "", currentAddress: "", permanentAddress: "", emergencyContact: "", photo: "" });
  const [professional, setProfessional] = useState({ personnelNo: "", doj: "", bps: "", empCategory: "Active Permanent", designation: "", ddoCode: "", prevExperience: "", prevInstitution: "" });
  const [financial, setFinancial] = useState({ bankName: "", accountNo: "", accountTitle: "", ntn: "" });
  
  // Dynamic Arrays
  const [education, setEducation] = useState<{level: string, institute: string, passingYear: string, subjects: string, document: string}[]>([ { level: "Matriculation", institute: "", passingYear: "", subjects: "", document: "" } ]);
  const [allowances, setAllowances] = useState<{name: string, amount: number}[]>([ { name: "Basic Pay", amount: 0 } ]);
  const [deductions, setDeductions] = useState<{name: string, amount: number}[]>([]);

  useEffect(() => {
    setIsMounted(true);
    const unsub = onSnapshot(query(collection(db, "staff")), (snapshot) => {
      setStaffList(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // --- AUTO CALCULATIONS ---
  const grossPay = allowances.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalDeductions = deductions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const netPay = grossPay - totalDeductions;

  // --- DYNAMIC FIELD HANDLERS ---
  const addEducation = () => setEducation([...education, { level: "Bachelors (BA/BSc)", institute: "", passingYear: "", subjects: "", document: "" }]);
  const removeEducation = (index: number) => setEducation(education.filter((_, i) => i !== index));
  const updateEducation = (index: number, field: string, value: string) => {
    const newArr = [...education];
    newArr[index] = { ...newArr[index], [field]: value };
    setEducation(newArr);
  };
  const handleEduDocUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await convertToBase64(file);
      updateEducation(index, 'document', base64);
    }
  };

  const addAllowance = () => setAllowances([...allowances, { name: "", amount: 0 }]);
  const removeAllowance = (index: number) => setAllowances(allowances.filter((_, i) => i !== index));
  const updateAllowance = (index: number, field: string, value: string | number) => {
    const newArr = [...allowances];
    newArr[index] = { ...newArr[index], [field]: value };
    setAllowances(newArr);
  };

  const addDeduction = () => setDeductions([...deductions, { name: "", amount: 0 }]);
  const removeDeduction = (index: number) => setDeductions(deductions.filter((_, i) => i !== index));
  const updateDeduction = (index: number, field: string, value: string | number) => {
    const newArr = [...deductions];
    newArr[index] = { ...newArr[index], [field]: value };
    setDeductions(newArr);
  };

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await convertToBase64(file);
      setPersonal({...personal, photo: base64});
    }
  };

  // --- REAL AI FILE UPLOAD HANDLER ---
  const handleRealAIExtract = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);

    try {
      // Simulate API call delay for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`✅ File "${file.name}" ready for extraction! Connect your API here.`);
      
    } catch (error) {
      alert("Error parsing document.");
      console.error(error);
    } finally {
      setIsExtracting(false);
      e.target.value = "";
    }
  };

  const handleSaveProfile = async () => {
    if(!personal.fullName || !personal.cnic) return alert("Full Name and CNIC are required.");
    setLoading(true);
    try {
      const docId = personal.cnic || Date.now().toString();
      await setDoc(doc(db, "staff", docId), {
        personal, professional, education, financial, allowances, deductions, netPayDetails: { grossPay, totalDeductions, netPay }, createdAt: serverTimestamp()
      });
      setSuccess(true); setTimeout(() => setSuccess(false), 3000);
      // Optional: Reset form fields here if you want to clear after save
    } catch (error) { alert("Failed to save"); } finally { setLoading(false); }
  };

  if (!isMounted) return null;

  const TABS = [
    { id: "personal", label: "Basic Info", icon: Users },
    { id: "education", label: "Educational", icon: GraduationCap },
    { id: "professional", label: "Professional", icon: Briefcase },
    { id: "financial", label: "Financial", icon: Wallet },
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Staff Onboarding</h1>
          <p className="text-sm text-slate-500 mt-1">Enterprise HR Management System</p>
        </div>
        <button onClick={handleSaveProfile} disabled={loading} className="bg-[#0F172A] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50">
           {loading ? "Saving..." : <><Save size={18}/> Complete Registration</>}
        </button>
      </div>

      {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-100 font-bold"><CheckCircle2 size={20}/> Profile Saved Successfully!</div>}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* --- LEFT: COMPREHENSIVE FORM --- */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* REAL AI EXTRACTOR BANNER */}
          <div className="bg-[#3ac47d] rounded-2xl p-6 shadow-md text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0"><Zap size={24}/></div>
               <div>
                 <h2 className="text-xl font-black">AI Auto-Extract</h2>
                 <p className="text-sm opacity-90 font-medium">Upload Salary Slip or CV to auto-fill all 4 tabs magically.</p>
               </div>
            </div>
            
            <label className={`bg-white text-[#3ac47d] px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-50 transition-colors shadow-sm whitespace-nowrap cursor-pointer ${isExtracting ? 'opacity-70 pointer-events-none' : ''}`}>
               {isExtracting ? <><Loader2 size={18} className="animate-spin"/> Scanning Document...</> : <><Upload size={18}/> Upload & Scan</>}
               <input type="file" accept=".pdf,image/png,image/jpeg,image/jpg" className="hidden" onChange={handleRealAIExtract} disabled={isExtracting} />
            </label>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
             
             {/* TOP TABS NAVIGATION */}
             <div className="flex overflow-x-auto border-b border-slate-100 bg-slate-50/50">
               {TABS.map(tab => (
                 <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-4 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id ? "border-[#3ac47d] text-[#3ac47d] bg-white" : "border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800"}`}>
                   <tab.icon size={16}/> {tab.label}
                 </button>
               ))}
             </div>

             <div className="p-8 min-h-[500px]">
                
                {/* TAB 1: PERSONAL */}
                {activeTab === "personal" && (
                  <div className="space-y-6 animate-fade-in-down">
                    <div className="flex items-center gap-6 mb-6">
                      <div className="w-24 h-24 bg-slate-100 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center relative overflow-hidden group">
                        {personal.photo ? <img src={personal.photo} className="w-full h-full object-cover"/> : <Users className="text-slate-400"/>}
                        <input type="file" onChange={handleProfilePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center py-1 opacity-0 group-hover:opacity-100">Upload Photo</div>
                      </div>
                      <div>
                        <h3 className="font-black text-[#0F172A] text-lg">Personal Identity</h3>
                        <p className="text-xs text-slate-500">Basic demographic information.</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input placeholder="Full Name" value={personal.fullName} onChange={e => setPersonal({...personal, fullName: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#3ac47d]" />
                      <input placeholder="Father/Husband Name" value={personal.fatherName} onChange={e => setPersonal({...personal, fatherName: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#3ac47d]" />
                      <input placeholder="CNIC Number" value={personal.cnic} onChange={e => setPersonal({...personal, cnic: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#3ac47d]" />
                      <input type="date" value={personal.dob} onChange={e => setPersonal({...personal, dob: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#3ac47d]" />
                      
                      <div className="flex gap-2">
                        <select value={personal.gender} onChange={e => setPersonal({...personal, gender: e.target.value})} className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#3ac47d]">
                          <option>Male</option><option>Female</option><option>Other</option>
                        </select>
                        <select value={personal.maritalStatus} onChange={e => setPersonal({...personal, maritalStatus: e.target.value})} className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#3ac47d]">
                          <option>Single</option><option>Married</option>
                        </select>
                      </div>
                      
                      <input placeholder="Phone Number" value={personal.phone} onChange={e => setPersonal({...personal, phone: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#3ac47d]" />
                      <input placeholder="Email Address" value={personal.email} onChange={e => setPersonal({...personal, email: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none sm:col-span-2" />
                      <textarea placeholder="Current Address" value={personal.currentAddress} onChange={e => setPersonal({...personal, currentAddress: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none sm:col-span-2"></textarea>
                      <input placeholder="Emergency Contact (Name & Number)" value={personal.emergencyContact} onChange={e => setPersonal({...personal, emergencyContact: e.target.value})} className="bg-red-50 border border-red-100 text-red-900 rounded-xl px-4 py-3 text-sm font-bold outline-none sm:col-span-2" />
                    </div>
                  </div>
                )}

                {/* TAB 2: EDUCATION (Dynamic with Documents) */}
                {activeTab === "education" && (
                  <div className="space-y-6 animate-fade-in-down">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="font-black text-[#0F172A] text-lg">Academic Qualifications</h3>
                        <p className="text-xs text-slate-500">Add degrees from Matriculation to Ph.D.</p>
                      </div>
                      <button onClick={addEducation} className="bg-[#3ac47d] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-[#2eaa6a] transition-colors"><PlusCircle size={16}/> Add Degree</button>
                    </div>

                    <div className="space-y-4">
                      {education.map((edu, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative group">
                          {education.length > 1 && (
                            <button onClick={() => removeEducation(idx)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            
                            <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Degree Level</label>
                              <select value={edu.level} onChange={e => updateEducation(idx, 'level', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:border-[#3ac47d]">
                                {EDU_LEVELS.map(lvl => <option key={lvl}>{lvl}</option>)}
                              </select>
                            </div>

                            <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Board / University</label>
                              <input placeholder="e.g. BISE Lahore" value={edu.institute} onChange={e => updateEducation(idx, 'institute', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:border-[#3ac47d]" />
                            </div>

                            <div className="space-y-1 sm:col-span-1 lg:col-span-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Passing Year</label>
                              <input placeholder="e.g. 2015" value={edu.passingYear} onChange={e => updateEducation(idx, 'passingYear', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:border-[#3ac47d]" />
                            </div>

                            <div className="space-y-1 sm:col-span-1 lg:col-span-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Subjects / Major</label>
                              <input placeholder="e.g. Science, Physics" value={edu.subjects} onChange={e => updateEducation(idx, 'subjects', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:border-[#3ac47d]" />
                            </div>

                            {/* Scanned Document Upload Field */}
                            <div className="sm:col-span-2 lg:col-span-4 mt-2">
                               <div className="relative bg-white border border-dashed border-slate-300 rounded-xl p-3 flex items-center justify-between hover:border-[#3ac47d] transition-colors cursor-pointer overflow-hidden">
                                 <input type="file" onChange={(e) => handleEduDocUpload(e, idx)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                 <div className="flex items-center gap-3">
                                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${edu.document ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                     {edu.document ? <FileCheck size={16}/> : <FileText size={16}/>}
                                   </div>
                                   <p className={`text-xs font-bold ${edu.document ? 'text-green-600' : 'text-slate-500'}`}>
                                     {edu.document ? "Document Uploaded Successfully" : "Upload Scanned Degree/Certificate (Image/PDF)"}
                                   </p>
                                 </div>
                                 <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">Browse</div>
                               </div>
                            </div>

                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: PROFESSIONAL */}
                {activeTab === "professional" && (
                  <div className="space-y-6 animate-fade-in-down">
                    <div>
                      <h3 className="font-black text-[#0F172A] text-lg">Professional Experience</h3>
                      <p className="text-xs text-slate-500">Employment history and official designations.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Personnel No / Emp ID</label>
                        <input value={professional.personnelNo} onChange={e => setProfessional({...professional, personnelNo: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Date of Joining</label>
                        <input type="date" value={professional.doj} onChange={e => setProfessional({...professional, doj: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Designation / Title</label>
                        <input placeholder="e.g. Senior Science Teacher" value={professional.designation} onChange={e => setProfessional({...professional, designation: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none" />
                      </div>
                      <div className="flex gap-4">
                        <div className="space-y-1 w-1/3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">BPS Scale</label>
                          <input placeholder="e.g. 16" value={professional.bps} onChange={e => setProfessional({...professional, bps: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none" />
                        </div>
                        <div className="space-y-1 w-2/3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                          <select value={professional.empCategory} onChange={e => setProfessional({...professional, empCategory: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none">
                            <option>Active Permanent</option><option>Contract</option><option>Visiting</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase">DDO Code (Govt Only)</label>
                         <input value={professional.ddoCode} onChange={e => setProfessional({...professional, ddoCode: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none" />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-bold text-slate-400 uppercase">Total Previous Experience</label>
                         <input placeholder="e.g. 5 Years" value={professional.prevExperience} onChange={e => setProfessional({...professional, prevExperience: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none" />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-bold text-slate-400 uppercase">Previous Institution</label>
                         <input placeholder="e.g. Allied Schools" value={professional.prevInstitution} onChange={e => setProfessional({...professional, prevInstitution: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: FINANCIAL (Allowances & Deductions) */}
                {activeTab === "financial" && (
                  <div className="space-y-6 animate-fade-in-down">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       
                       {/* ALLOWANCES */}
                       <div>
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest">Pay & Allowances</h3>
                            <button onClick={addAllowance} className="text-blue-500 hover:bg-blue-50 p-1 rounded-md transition-colors"><PlusCircle size={18}/></button>
                         </div>
                         <div className="space-y-2">
                           {allowances.map((item, idx) => (
                             <div key={idx} className="flex gap-2 items-center">
                               <input placeholder="Allowance Name" value={item.name} onChange={e => updateAllowance(idx, 'name', e.target.value)} className="w-2/3 bg-blue-50 border border-transparent rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-blue-300 text-blue-900" />
                               <input type="number" placeholder="Rs" value={item.amount || ''} onChange={e => updateAllowance(idx, 'amount', e.target.value)} className="w-1/3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-black text-right outline-none focus:border-blue-500" />
                               <button onClick={() => removeAllowance(idx)} className="text-slate-300 hover:text-red-500"><Trash2 size={14}/></button>
                             </div>
                           ))}
                         </div>
                         <div className="mt-4 bg-blue-500 text-white p-3 rounded-xl flex justify-between items-center font-black">
                            <span>Gross Pay</span>
                            <span>Rs. {grossPay.toLocaleString()}</span>
                         </div>
                       </div>

                       {/* DEDUCTIONS */}
                       <div>
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest">Deductions</h3>
                            <button onClick={addDeduction} className="text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors"><PlusCircle size={18}/></button>
                         </div>
                         <div className="space-y-2">
                           {deductions.map((item, idx) => (
                             <div key={idx} className="flex gap-2 items-center">
                               <input placeholder="Deduction Name" value={item.name} onChange={e => updateDeduction(idx, 'name', e.target.value)} className="w-2/3 bg-red-50 border border-transparent rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-red-300 text-red-900" />
                               <input type="number" placeholder="Rs" value={item.amount || ''} onChange={e => updateDeduction(idx, 'amount', e.target.value)} className="w-1/3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-black text-right outline-none focus:border-red-500 text-red-600" />
                               <button onClick={() => removeDeduction(idx)} className="text-slate-300 hover:text-red-500"><Trash2 size={14}/></button>
                             </div>
                           ))}
                         </div>
                         <div className="mt-4 bg-red-100 text-red-600 p-3 rounded-xl flex justify-between items-center font-black">
                            <span>Total Deductions</span>
                            <span>- Rs. {totalDeductions.toLocaleString()}</span>
                         </div>
                       </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                      <h3 className="text-xs font-bold text-[#3ac47d] uppercase tracking-widest mb-4">Bank Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                         <input placeholder="Bank Name" value={financial.bankName} onChange={e => setFinancial({...financial, bankName: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#3ac47d]" />
                         <input placeholder="Account Title" value={financial.accountTitle} onChange={e => setFinancial({...financial, accountTitle: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#3ac47d]" />
                         <input placeholder="Account / IBAN Number" value={financial.accountNo} onChange={e => setFinancial({...financial, accountNo: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#3ac47d]" />
                         <input placeholder="NTN Number" value={financial.ntn} onChange={e => setFinancial({...financial, ntn: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#3ac47d]" />
                      </div>
                      
                      <div className="mt-6 bg-[#0F172A] text-white p-6 rounded-2xl flex justify-between items-center">
                         <div>
                           <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Final Net Salary</p>
                         </div>
                         <p className="text-3xl sm:text-4xl font-black text-[#3ac47d]">Rs. {netPay.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}

             </div>
          </div>
        </div>

        {/* --- RIGHT: STAFF DIRECTORY (NOW INTERLINKED) --- */}
        <div className="xl:col-span-4">
           <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-6">
              <h2 className="text-lg font-black text-[#0F172A] mb-6">Staff Directory</h2>
              <div className="space-y-3 h-[600px] overflow-y-auto pr-2">
                 {staffList.length === 0 ? (
                    <div className="py-10 text-center opacity-50">
                       <Users size={40} className="mx-auto mb-3 text-slate-300"/>
                       <p className="font-bold text-sm">No staff added yet.</p>
                    </div>
                 ) : (
                    staffList.map(staff => (
                       // HERE IS THE FIX: Link wraps the card to navigate to staff-profile
                       <Link href={`/staff-profile?id=${staff.id}`} key={staff.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-[#3ac47d] transition-colors cursor-pointer group flex items-start gap-3 block">
                          <div className="w-10 h-10 rounded-full bg-white border border-slate-200 overflow-hidden shrink-0 mt-1">
                            {staff.personal?.photo ? <img src={staff.personal.photo} className="w-full h-full object-cover"/> : <Users size={16} className="m-auto mt-2 text-slate-300"/>}
                          </div>
                          <div className="flex-1">
                            <p className="font-black text-[#0F172A] group-hover:text-[#3ac47d] transition-colors text-sm">{staff.personal?.fullName}</p>
                            <p className="text-[10px] font-bold text-slate-500 mt-0.5">{staff.professional?.designation} • BPS {staff.professional?.bps || "N/A"}</p>
                            <div className="mt-2 flex justify-between items-end border-t border-slate-200 pt-2">
                               <p className="text-[9px] text-slate-400 font-bold uppercase">{staff.professional?.personnelNo}</p>
                               <p className="text-xs font-black text-green-600">Rs. {staff.netPayDetails?.netPay?.toLocaleString() || 0}</p>
                            </div>
                          </div>
                       </Link>
                    ))
                 )}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
