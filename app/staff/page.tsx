"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, Building2, Wallet, PlusCircle, Trash2, Save, 
  CheckCircle2, GraduationCap, Briefcase, FileText, 
  FileCheck, Loader2, Edit3 
} from "lucide-react";

// (Types and Base64 function remain the same)
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
  
  // 👉 Data now comes from API, not direct Firestore
  const [staffList, setStaffList] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState("personal");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [personal, setPersonal] = useState({ fullName: "", fatherName: "", cnic: "", dob: "", gender: "Male", maritalStatus: "Single", email: "", phone: "", currentAddress: "", permanentAddress: "", emergencyContact: "", photo: "" });
  const [professional, setProfessional] = useState({ personnelNo: "", doj: "", bps: "", empCategory: "Active Permanent", designation: "", ddoCode: "", prevExperience: "", prevInstitution: "" });
  const [financial, setFinancial] = useState({ bankName: "", accountNo: "", accountTitle: "", ntn: "" });
  const [education, setEducation] = useState<EduRecord[]>([ { level: "Matriculation", institute: "", passingYear: "", subjects: "", document: "" } ]);
  const [allowances, setAllowances] = useState<FinancialRecord[]>([ { name: "Basic Pay", amount: 0 } ]);
  const [deductions, setDeductions] = useState<FinancialRecord[]>([]);

  // 👉 FETCH STAFF VIA SECURE API
  const fetchStaffData = async () => {
    try {
      const res = await fetch("/api/staff", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setStaffList(data);
      }
    } catch (error) {
      console.error("Failed to fetch staff");
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchStaffData(); // Load data on mount
  }, []);

  const grossPay = allowances.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalDeductions = deductions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const netPay = grossPay - totalDeductions;

  // (Dynamic handlers like addEducation, removeEducation etc. remain the same)
  const addEducation = () => setEducation([...education, { level: "Bachelors (BA/BSc)", institute: "", passingYear: "", subjects: "", document: "" }]);
  const removeEducation = (index: number) => setEducation(education.filter((_, i) => i !== index));
  const updateEducation = (index: number, field: string, value: string) => {
    const newArr = [...education];
    newArr[index] = { ...newArr[index], [field]: value };
    setEducation(newArr);
  };
  
  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await convertToBase64(file);
      setPersonal({...personal, photo: base64});
    }
  };

  const addAllowance = () => setAllowances([...allowances, { name: "", amount: 0 }]);
  const removeAllowance = (index: number) => setAllowances(allowances.filter((_, i) => i !== index));
  const updateAllowance = (index: number, field: string, value: string | number) => {
    const newArr = [...allowances];
    newArr[index] = { ...newArr[index], [field]: value };
    setAllowances(newArr);
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

  // 👉 SAVE STAFF VIA SECURE API
  const handleSaveProfile = async () => {
    if(!personal.fullName || !personal.cnic) return alert("Full Name and CNIC are required.");
    if(!professional.personnelNo) return alert("Emp ID (Personnel No) is required.");

    setLoading(true);
    try {
      const generatedEmail = personal.email || `emp${professional.personnelNo}@edupilot.com`;
      const generatedPassword = personal.cnic.replace(/[^0-9]/g, '');

      // 1. Create User Identity & Assign Tenant (Via /api/create-user)
      if (!editingId) {
         const userRes = await fetch('/api/create-user', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
              email: generatedEmail,
              password: generatedPassword,
              role: 'teacher'
           }),
           credentials: "include"
         });
         
         const userResult = await userRes.json();
         if (!userRes.ok && !userResult.error?.includes("already exists")) {
            throw new Error(`Failed to create login: ${userResult.error}`);
         }
      }

      // 2. Save HR Record (Via /api/staff)
      const staffPayload = {
        personal, 
        professional, 
        education, 
        financial, 
        allowances, 
        deductions, 
        netPayDetails: { grossPay, totalDeductions, netPay }, 
        loginDetails: { email: generatedEmail, role: 'teacher' }
      };

      const saveRes = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffPayload),
        credentials: "include"
      });

      if (!saveRes.ok) throw new Error("Failed to save HR record");

      setSuccess(true); 
      resetForm();
      fetchStaffData(); // Refresh the list
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) { 
       alert("Action Failed: " + error.message);
    } finally { 
       setLoading(false); 
    }
  };

  if (!isMounted) return null;

  return (
    <div className="animate-fade-in space-y-6 pb-20 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 w-full">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight uppercase">
            {editingId ? "Update Staff" : "Staff Onboarding"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Tenant-Isolated HR System</p>
        </div>
  
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {editingId && (
            <button onClick={resetForm} className="bg-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-300 w-full sm:w-auto">
              Cancel Edit
            </button>
          )}
          <button onClick={handleSaveProfile} disabled={loading} className="bg-[#0F172A] text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 w-full sm:w-auto uppercase tracking-widest">
            {loading ? "Saving..." : <span className="flex items-center gap-2"><Save size={18}/> {editingId ? "Update Record" : "Save Record"}</span>}
          </button>
        </div>
      </div>

      {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-100 font-bold uppercase"><CheckCircle2 size={20}/> Profile Saved Successfully!</div>}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 w-full">
        
        {/* --- LEFT: COMPREHENSIVE FORM --- */}
        <div className="xl:col-span-8 space-y-6 w-full">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden w-full">
             
             {/* TOP TABS NAVIGATION */}
             <div className="flex overflow-x-auto border-b border-slate-100 bg-slate-50/50 w-full">
               <button onClick={() => setActiveTab("personal")} className={`flex-1 py-4 px-4 font-bold text-sm flex items-center justify-center gap-2 border-b-2 whitespace-nowrap ${activeTab === "personal" ? "border-[#3ac47d] text-[#3ac47d] bg-white" : "border-transparent text-slate-500 hover:bg-slate-100"}`}>
                 <Users size={16}/> Basic Info
               </button>
               {/* Other tabs remain similar... */}
               <button onClick={() => setActiveTab("professional")} className={`flex-1 py-4 px-4 font-bold text-sm flex items-center justify-center gap-2 border-b-2 whitespace-nowrap ${activeTab === "professional" ? "border-[#3ac47d] text-[#3ac47d] bg-white" : "border-transparent text-slate-500 hover:bg-slate-100"}`}>
                 <Briefcase size={16}/> Professional
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
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      <input placeholder="Full Name" value={personal.fullName} onChange={e => setPersonal({...personal, fullName: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#3ac47d] uppercase w-full" />
                      <input placeholder="Father/Husband Name" value={personal.fatherName} onChange={e => setPersonal({...personal, fatherName: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#3ac47d] uppercase w-full" />
                      <input placeholder="CNIC Number" value={personal.cnic} onChange={e => setPersonal({...personal, cnic: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#3ac47d] w-full" />
                      <input type="date" value={personal.dob} onChange={e => setPersonal({...personal, dob: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#3ac47d] w-full" />
                      <input placeholder="Phone Number" value={personal.phone} onChange={e => setPersonal({...personal, phone: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#3ac47d] w-full" />
                      <input placeholder="Email Address" value={personal.email} onChange={e => setPersonal({...personal, email: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none w-full" />
                    </div>
                  </div>
                )}

                {/* TAB 3: PROFESSIONAL */}
                {activeTab === "professional" && (
                  <div className="space-y-6 animate-fade-in-down w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Emp ID</label><input value={professional.personnelNo} onChange={e => setProfessional({...professional, personnelNo: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none uppercase" /></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Designation</label><input value={professional.designation} onChange={e => setProfessional({...professional, designation: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none uppercase" /></div>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* --- RIGHT: STAFF DIRECTORY --- */}
        <div className="xl:col-span-4 w-full">
           <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-6 w-full">
              <h2 className="text-lg font-black text-[#0F172A] mb-6 uppercase">Directory</h2>
              <div className="space-y-4 h-[500px] overflow-y-auto pr-2 w-full">
                 {staffList.length === 0 ? (
                    <div className="py-10 text-center opacity-50"><Users size={40} className="mx-auto mb-3 text-slate-300"/><p className="font-bold text-sm uppercase">Loading / Empty</p></div>
                 ) : (
                    staffList.map(staff => (
                       <div key={staff.id} className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm w-full">
                          <div className="flex items-start gap-3 w-full">
                             <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 overflow-hidden shrink-0 mt-1">
                               {staff.personal?.photo ? <img src={staff.personal.photo} className="w-full h-full object-cover"/> : <Users size={16} className="m-auto mt-2 text-slate-300"/>}
                             </div>
                             <div className="flex-1 min-w-0">
                               <p className="font-black text-[#0F172A] text-sm truncate uppercase">{staff.personal?.fullName || "Unnamed"}</p>
                               <p className="text-[10px] font-bold text-slate-500 mt-0.5 truncate uppercase">{staff.professional?.designation} • Emp: {staff.professional?.personnelNo}</p>
                             </div>
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
