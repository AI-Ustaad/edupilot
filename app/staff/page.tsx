"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, setDoc, doc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Users, Building2, Wallet, PlusCircle, Trash2, Save, 
  CheckCircle2, GraduationCap, Briefcase, FileText, 
  FileCheck, Loader2, Edit3, Eye
} from "lucide-react";

type EduRecord = { level: string; institute: string; passingYear: string; subjects: string; document: string; };
type FinancialRecord = { name: string; amount: number; };

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
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState("personal");
  const [editingId, setEditingId] = useState<string | null>(null);

  // 👉 RBAC State
  const [role, setRole] = useState("loading");

  // --- STATE MANAGEMENT ---
  const [personal, setPersonal] = useState({ fullName: "", fatherName: "", cnic: "", dob: "", gender: "Male", maritalStatus: "Single", email: "", phone: "", currentAddress: "", permanentAddress: "", emergencyContact: "", photo: "" });
  const [professional, setProfessional] = useState({ personnelNo: "", doj: "", bps: "", empCategory: "Active Permanent", designation: "", ddoCode: "", prevExperience: "", prevInstitution: "" });
  const [financial, setFinancial] = useState({ bankName: "", accountNo: "", accountTitle: "", ntn: "" });
  const [education, setEducation] = useState<EduRecord[]>([ { level: "Matriculation", institute: "", passingYear: "", subjects: "", document: "" } ]);
  const [allowances, setAllowances] = useState<FinancialRecord[]>([ { name: "Basic Pay", amount: 0 } ]);
  const [deductions, setDeductions] = useState<FinancialRecord[]>([]);

  // 👉 Security Guard: Check Role before rendering
  useEffect(() => {
    fetch("/api/users/get", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.role !== "admin") {
          router.replace("/dashboard"); // Kick out non-admins
        } else {
          setRole("admin");
        }
      })
      .catch(() => router.replace("/dashboard"));
  }, [router]);

  useEffect(() => {
    setIsMounted(true);
    if (role === "admin") {
      const unsub = onSnapshot(query(collection(db, "staff")), (snapshot) => {
        setStaffList(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => unsub();
    }
  }, [role]);

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

  const resetForm = () => {
    setEditingId(null);
    setPersonal({ fullName: "", fatherName: "", cnic: "", dob: "", gender: "Male", maritalStatus: "Single", email: "", phone: "", currentAddress: "", permanentAddress: "", emergencyContact: "", photo: "" });
    setProfessional({ personnelNo: "", doj: "", bps: "", empCategory: "Active Permanent", designation: "", ddoCode: "", prevExperience: "", prevInstitution: "" });
    setFinancial({ bankName: "", accountNo: "", accountTitle: "", ntn: "" });
    setEducation([{ level: "Matriculation", institute: "", passingYear: "", subjects: "", document: "" }]);
    setAllowances([{ name: "Basic Pay", amount: 0 }]);
    setDeductions([]);
    setActiveTab("personal");
  };

  const handleSaveProfile = async () => {
    if(!personal.fullName || !personal.cnic) return alert("Full Name and CNIC are required.");
    if(!professional.personnelNo) return alert("Emp ID (Personnel No) is required to generate a login account.");

    setLoading(true);
    try {
      const docId = editingId || personal.cnic.replace(/[^0-9]/g, '') || Date.now().toString();
      const generatedEmail = personal.email || `emp${professional.personnelNo}@edupilot.com`;
      const generatedPassword = personal.cnic.replace(/[^0-9]/g, '');

      if (!editingId) {
         const response = await fetch('/api/create-user', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
              uid: docId,
              email: generatedEmail,
              password: generatedPassword,
              role: 'teacher',
              displayName: personal.fullName
           })
         });
         const result = await response.json();
         if (!result.success && !result.error?.includes("already exists")) {
            throw new Error(`Failed to create login: ${result.error}`);
         }
      }

      await setDoc(doc(db, "staff", docId), {
        personal, 
        professional, 
        education, 
        financial, 
        allowances, 
        deductions, 
        netPayDetails: { grossPay, totalDeductions, netPay }, 
        loginDetails: { 
           email: generatedEmail, 
           isFirstLogin: true, 
           role: 'teacher'
        },
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      setSuccess(true); 
      resetForm();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) { 
       alert("Action Failed: " + error.message);
    } finally { 
       setLoading(false); 
    }
  };

  const handleEditStaff = (staff: any) => {
    setEditingId(staff.id);
    setPersonal(staff.personal || {});
    setProfessional(staff.professional || {});
    setFinancial(staff.financial || {});
    setEducation(staff.education?.length ? staff.education : [{ level: "Matriculation", institute: "", passingYear: "", subjects: "", document: "" }]);
    setAllowances(staff.allowances?.length ? staff.allowances : [{ name: "Basic Pay", amount: 0 }]);
    setDeductions(staff.deductions || []);
    setActiveTab("personal");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteStaff = async (id: string) => {
    if(confirm("Are you sure you want to permanently delete this staff member's record?")) {
      try { await deleteDoc(doc(db, "staff", id));
      if(editingId === id) resetForm(); } 
      catch (error) { alert("Failed to delete record.");
      }
    }
  };

  if (!isMounted) return null;

  // 👉 Loading State While Checking Role
  if (role === "loading") {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <Loader2 className="animate-spin text-[#3ac47d]" size={40}/>
        <p className="text-sm font-bold text-slate-400 animate-pulse">Verifying Admin Access...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 pb-20 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 w-full">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
            {editingId ? "Update Staff Profile" : "Staff Onboarding"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Enterprise HR Management System</p>
        </div>
  
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {editingId && (
            <button onClick={resetForm} className="bg-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-300 transition-colors shadow-sm w-full sm:w-auto">
              Cancel Edit
            </button>
          )}
          <button onClick={handleSaveProfile} disabled={loading} className="bg-[#0F172A] text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50 w-full sm:w-auto">
            {loading ? "Saving..." : <span className="flex items-center gap-2"><Save size={18}/> {editingId ? "Update Record" : "Complete Registration"}</span>}
          </button>
        </div>
      </div>

      {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-100 font-bold"><CheckCircle2 size={20}/> Profile Saved Successfully! Account Created.</div>}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 w-full">
        
        {/* --- LEFT: COMPREHENSIVE FORM --- */}
        <div className="xl:col-span-8 space-y-6 w-full">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden w-full">
             
             {/* TOP TABS NAVIGATION */}
             <div className="flex overflow-x-auto border-b border-slate-100 bg-slate-50/50 w-full">
               <button onClick={() => setActiveTab("personal")} className={`flex-1 py-4 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors border-b-2 whitespace-nowrap ${activeTab === "personal" ? "border-[#3ac47d] text-[#3ac47d] bg-white" : "border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800"}`}>
                 <Users size={16}/> Basic Info
               </button>
               <button onClick={() => setActiveTab("education")} className={`flex-1 py-4 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors border-b-2 whitespace-nowrap ${activeTab === "education" ? "border-[#3ac47d] text-[#3ac47d] bg-white" : "border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800"}`}>
                 <GraduationCap size={16}/> Educational
               </button>
               <button onClick={() => setActiveTab("professional")} className={`flex-1 py-4 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors border-b-2 whitespace-nowrap ${activeTab === "professional" ? "border-[#3ac47d] text-[#3ac47d] bg-white" : "border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800"}`}>
                 <Briefcase size={16}/> Professional
               </button>
               <button onClick={() => setActiveTab("financial")} className={`flex-1 py-4 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors border-b-2 whitespace-nowrap ${activeTab === "financial" ? "border-[#3ac47d] text-[#3ac47d] bg-white" : "border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800"}`}>
                 <Wallet size={16}/> Financial
               </button>
             </div>

             <div className="p-4 md:p-8 min-h-[500px] w-full">
                {/* TAB 1: PERSONAL */}
                {activeTab === "personal" && (
                  <div className="space-y-6 animate-fade-in-down w-full">
                    <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                      <div className="w-24 h-24 bg-slate-100 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center relative overflow-hidden group shrink-0">
                        {personal.photo ? <img src={personal.photo} className="w-full h-full object-cover"/> : <Users className="text-slate-400"/>}
                        <input type="file" onChange={handleProfilePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center py-1 opacity-0 group-hover:opacity-100">Upload Photo</div>
                      </div>
                      <div className="text-center sm:text-left">
                        <h3 className="font-black text-[#0F172A] text-lg">Personal Identity</h3>
                        <p className="text-xs text-slate-500">Basic demographic information.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      <input placeholder="Full Name" value={personal.fullName} onChange={e => setPersonal({...personal, fullName: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#3ac47d] w-full" />
                      <input placeholder="Father/Husband Name" value={personal.fatherName} onChange={e => setPersonal({...personal, fatherName: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#3ac47d] w-full" />
                      <input placeholder="CNIC Number (Without Dashes)" value={personal.cnic} onChange={e => setPersonal({...personal, cnic: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#3ac47d] w-full" />
                      <input type="date" value={personal.dob} onChange={e => setPersonal({...personal, dob: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#3ac47d] w-full" />
                      <div className="flex gap-2 w-full">
                        <select value={personal.gender} onChange={e => setPersonal({...personal, gender: e.target.value})} className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#3ac47d]">
                          <option>Male</option><option>Female</option><option>Other</option>
                        </select>
                        <select value={personal.maritalStatus} onChange={e => setPersonal({...personal, maritalStatus: e.target.value})} className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#3ac47d]">
                          <option>Single</option><option>Married</option>
                        </select>
                      </div>
                      <input placeholder="Phone Number" value={personal.phone} onChange={e => setPersonal({...personal, phone: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#3ac47d] w-full" />
                      <input placeholder="Email Address (Optional)" value={personal.email} onChange={e => setPersonal({...personal, email: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none sm:col-span-2 w-full" />
                      <textarea placeholder="Current Address" value={personal.currentAddress} onChange={e => setPersonal({...personal, currentAddress: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none sm:col-span-2 w-full"></textarea>
                    </div>
                  </div>
                )}

                {/* TAB 2: EDUCATION */}
                {activeTab === "education" && (
                  <div className="space-y-6 animate-fade-in-down w-full">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-black text-[#0F172A] text-lg">Academic Qualifications</h3>
                      <button onClick={addEducation} className="bg-[#3ac47d] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-[#2eaa6a]"><PlusCircle size={16}/> Add</button>
                    </div>
                    <div className="space-y-4 w-full">
                      {education.map((edu, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative group w-full">
                          {education.length > 1 && <button onClick={() => removeEducation(idx)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Degree Level</label>
                              <select value={edu.level} onChange={e => updateEducation(idx, 'level', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:border-[#3ac47d]">
                                {EDU_LEVELS.map(lvl => <option key={lvl}>{lvl}</option>)}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Board / University</label>
                              <input value={edu.institute} onChange={e => updateEducation(idx, 'institute', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:border-[#3ac47d]" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Passing Year</label>
                              <input value={edu.passingYear} onChange={e => updateEducation(idx, 'passingYear', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:border-[#3ac47d]" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Subjects</label>
                              <input value={edu.subjects} onChange={e => updateEducation(idx, 'subjects', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:border-[#3ac47d]" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: PROFESSIONAL */}
                {activeTab === "professional" && (
                  <div className="space-y-6 animate-fade-in-down w-full">
                    <h3 className="font-black text-[#0F172A] text-lg">Professional Experience</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Emp ID (Required for Login)</label><input value={professional.personnelNo} onChange={e => setProfessional({...professional, personnelNo: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none" /></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Date of Joining</label><input type="date" value={professional.doj} onChange={e => setProfessional({...professional, doj: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none" /></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Designation</label><input value={professional.designation} onChange={e => setProfessional({...professional, designation: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none" /></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">BPS / Scale</label><input value={professional.bps} onChange={e => setProfessional({...professional, bps: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none" /></div>
                      <div className="space-y-1 sm:col-span-2"><label className="text-[10px] font-bold text-slate-400 uppercase">Previous Experience</label><input value={professional.prevExperience} onChange={e => setProfessional({...professional, prevExperience: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none" /></div>
                    </div>
                  </div>
                )}

                {/* TAB 4: FINANCIAL */}
                {activeTab === "financial" && (
                  <div className="space-y-6 animate-fade-in-down w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                       <div className="w-full">
                         <div className="flex justify-between items-center mb-4"><h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest">Pay & Allowances</h3><button onClick={addAllowance} className="text-blue-500"><PlusCircle size={18}/></button></div>
                         <div className="space-y-2 w-full">
                           {allowances.map((item, idx) => (
                             <div key={idx} className="flex gap-2 items-center w-full">
                               <input value={item.name} onChange={e => updateAllowance(idx, 'name', e.target.value)} className="w-2/3 bg-blue-50 rounded-lg px-3 py-2 text-xs font-bold outline-none" />
                               <input type="number" value={item.amount || ''} onChange={e => updateAllowance(idx, 'amount', e.target.value)} className="w-1/3 border border-slate-200 rounded-lg px-3 py-2 text-xs font-black text-right outline-none" />
                               <button onClick={() => removeAllowance(idx)} className="text-slate-300 hover:text-red-500"><Trash2 size={14}/></button>
                             </div>
                           ))}
                         </div>
                         <div className="mt-4 bg-blue-500 text-white p-3 rounded-xl flex justify-between items-center font-black"><span>Gross Pay</span><span>Rs. {grossPay.toLocaleString()}</span></div>
                       </div>
                    </div>
                    <div className="mt-6 bg-[#0F172A] text-white p-6 rounded-2xl flex justify-between items-center w-full">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Final Net Salary</p>
                       <p className="text-2xl sm:text-4xl font-black text-[#3ac47d]">Rs. {netPay.toLocaleString()}</p>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* --- RIGHT: STAFF DIRECTORY --- */}
        <div className="xl:col-span-4 w-full">
           <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-6 w-full">
              <h2 className="text-lg font-black text-[#0F172A] mb-6">Staff Directory</h2>
              <div className="space-y-4 h-[500px] overflow-y-auto pr-2 w-full">
                 {staffList.length === 0 ? (
                    <div className="py-10 text-center opacity-50"><Users size={40} className="mx-auto mb-3 text-slate-300"/><p className="font-bold text-sm">No staff added yet.</p></div>
                 ) : (
                    staffList.map(staff => (
                       <div key={staff.id} className={`bg-white p-4 rounded-2xl border-2 transition-all ${editingId === staff.id ? 'border-[#3ac47d] shadow-md' : 'border-slate-100 shadow-sm'} w-full`}>
                          <div className="flex items-start gap-3 w-full">
                             <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 overflow-hidden shrink-0 mt-1">
                               {staff.personal?.photo ? <img src={staff.personal.photo} className="w-full h-full object-cover"/> : <Users size={16} className="m-auto mt-2 text-slate-300"/>}
                             </div>
                             <div className="flex-1 min-w-0">
                               <p className="font-black text-[#0F172A] text-sm truncate">{staff.personal?.fullName || "Unnamed"}</p>
                               <p className="text-[10px] font-bold text-slate-500 mt-0.5 truncate">{staff.professional?.designation} • Emp: {staff.professional?.personnelNo}</p>
                             </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 w-full">
                             <button onClick={() => handleEditStaff(staff)} className="flex-1 bg-orange-50 text-orange-600 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-black uppercase"><Edit3 size={12}/> Edit</button>
                             <button onClick={() => handleDeleteStaff(staff.id)} className="w-10 flex items-center justify-center bg-red-50 text-red-600 py-2 rounded-lg text-[10px] font-black"><Trash2 size={14}/></button>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
