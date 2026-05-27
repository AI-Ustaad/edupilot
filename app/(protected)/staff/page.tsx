"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, Building2, Wallet, Plus, Trash2, Save, 
  CheckCircle2, GraduationCap, Briefcase, FileText, 
  Loader2, Upload, X
} from "lucide-react";

type EduRecord = { level: string; institute: string; passingYear: string; subjects: string; document: string; };
type FinancialRecord = { name: string; amount: number; };

const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
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
  const [selectedRole, setSelectedRole] = useState("teacher");
  const [currentUserRole, setCurrentUserRole] = useState("");

  // Existing form states (keep exactly as you have them)
  const [personal, setPersonal] = useState({ fullName: "", fatherName: "", cnic: "", dob: "", gender: "Male", maritalStatus: "Single", email: "", phone: "", currentAddress: "", permanentAddress: "", emergencyContact: "", photo: "" });
  const [professional, setProfessional] = useState({ personnelNo: "", doj: "", bps: "", empCategory: "Active Permanent", designation: "", ddoCode: "", prevExperience: "", prevInstitution: "" });
  const [financial, setFinancial] = useState({ bankName: "", accountNo: "", accountTitle: "", ntn: "" });
  const [education, setEducation] = useState<EduRecord[]>([ { level: "Matriculation", institute: "", passingYear: "", subjects: "", document: "" } ]);
  const [allowances, setAllowances] = useState<FinancialRecord[]>([ { name: "Basic Pay", amount: 0 } ]);
  const [deductions, setDeductions] = useState<FinancialRecord[]>([]);
  const [ocrLoading, setOcrLoading] = useState(false);

  // Import modal states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const fetchStaffData = async () => {
    try {
      const res = await fetch("/api/staff", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setStaffList(data.success ? data.data : data);
      }
    } catch (error) { console.error("Failed to fetch staff", error); }
  };

  useEffect(() => {
    fetch("/api/users/get", { credentials: "include" })
      .then(res => res.json())
      .then(data => setCurrentUserRole(data.role))
      .catch(() => setCurrentUserRole(""));
  }, []);

  useEffect(() => {
    setIsMounted(true);
    fetchStaffData();
  }, []);

  const grossPay = allowances.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalDeductions = deductions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const netPay = grossPay - totalDeductions;

  // Education handlers (keep existing)
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

  const handleOCRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrLoading(true);
    try {
      const base64 = await convertToBase64(file);
      const res = await fetch("/api/ocr/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, documentType: "salary_slip" }),
      });
      const data = await res.json();
      if (data.name) {
        setPersonal(prev => ({ ...prev, fullName: data.fullName || data.name || prev.fullName, fatherName: data.fatherName || prev.fatherName, cnic: data.cnic || prev.cnic, dob: data.dob || prev.dob, email: data.email || prev.email, phone: data.phone || prev.phone }));
        setProfessional(prev => ({ ...prev, personnelNo: data.personnelNo || prev.personnelNo, designation: data.designation || prev.designation, bps: data.bps || prev.bps, empCategory: data.empCategory || prev.empCategory, doj: data.doj || prev.doj }));
        setFinancial(prev => ({ ...prev, bankName: data.bankName || prev.bankName, accountNo: data.accountNo || prev.accountNo }));
        setAllowances(data.allowances || allowances);
        setDeductions(data.deductions || deductions);
      }
    } catch (err) { console.error("OCR failed", err); alert("Failed to extract data from document."); }
    finally { setOcrLoading(false); }
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

  const resetForm = () => {
    setEditingId(null);
    setPersonal({ fullName: "", fatherName: "", cnic: "", dob: "", gender: "Male", maritalStatus: "Single", email: "", phone: "", currentAddress: "", permanentAddress: "", emergencyContact: "", photo: "" });
    setProfessional({ personnelNo: "", doj: "", bps: "", empCategory: "Active Permanent", designation: "", ddoCode: "", prevExperience: "", prevInstitution: "" });
    setFinancial({ bankName: "", accountNo: "", accountTitle: "", ntn: "" });
    setEducation([{ level: "Matriculation", institute: "", passingYear: "", subjects: "", document: "" }]);
    setAllowances([{ name: "Basic Pay", amount: 0 }]);
    setDeductions([]);
    setActiveTab("personal");
    setSelectedRole("teacher");
  };

  const handleSaveProfile = async () => {
    if(!personal.fullName || !personal.cnic) return alert("Full Name and CNIC are required.");
    if(!professional.personnelNo) return alert("Emp ID (Personnel No) is required.");
    setLoading(true);
    try {
      const generatedEmail = personal.email || `emp${professional.personnelNo}@edupilot.com`;
      const generatedPassword = personal.cnic.replace(/[^0-9]/g, '');
      if (!editingId) {
         const userRes = await fetch('/api/create-user', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email: generatedEmail, password: generatedPassword, role: selectedRole }),
           credentials: "include"
         });
         const userResult = await userRes.json();
         if (!userRes.ok && !userResult.error?.includes("already exists")) throw new Error(`Failed to create login: ${userResult.error}`);
      }
      const staffPayload = { personal, professional, education, financial, allowances, deductions, netPayDetails: { grossPay, totalDeductions, netPay }, loginDetails: { email: generatedEmail, role: selectedRole } };
      const saveRes = await fetch('/api/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(staffPayload), credentials: "include" });
      if (!saveRes.ok) throw new Error("Failed to save HR record");
      setSuccess(true); resetForm(); fetchStaffData();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) { alert("Action Failed: " + error.message); } finally { setLoading(false); }
  };

  // Import CSV handler
  const handleImportCSV = async () => {
    if (!importFile) return;
    setImporting(true);
    try {
      const text = await importFile.text();
      const lines = text.split("\n").filter(l => l.trim());
      if (lines.length < 2) throw new Error("CSV must have header and data rows");
      const headers = lines[0].split(",").map(h => h.trim());
      const staffData = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",");
        const obj: any = {};
        headers.forEach((h, idx) => { obj[h] = values[idx] ? values[idx].trim() : ""; });
        staffData.push(obj);
      }
      const res = await fetch("/api/staff/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffList: staffData }),
        credentials: "include",
      });
      if (res.ok) {
        alert(`Imported ${staffData.length} staff members!`);
        await fetchStaffData();
        setShowImportModal(false);
        setImportFile(null);
      } else {
        const err = await res.json();
        alert("Import failed: " + err.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setImporting(false);
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
          <button onClick={() => setShowImportModal(true)} className="bg-green-600 text-gray-900 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2">
            <Upload size={18} /> Import CSV
          </button>
          {editingId && (
            <button onClick={resetForm} className="bg-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-300">
              Cancel Edit
            </button>
          )}
          <button onClick={handleSaveProfile} disabled={loading} className="bg-[#0F172A] text-gray-900 px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 uppercase tracking-widest">
            {loading ? "Saving..." : <span className="flex items-center gap-2"><Save size={18}/> {editingId ? "Update Record" : "Save Record"}</span>}
          </button>
        </div>
      </div>

      {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-100 font-bold uppercase"><CheckCircle2 size={20}/> Profile Saved Successfully!</div>}

      {/* Your existing form layout goes here (the tabs and fields) – unchanged */}
      {/* I am not repeating the long form for brevity, but keep your existing form content */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 w-full">
        <div className="xl:col-span-8 space-y-6 w-full">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden w-full">
            <div className="flex overflow-x-auto border-b border-slate-100 bg-slate-50/50 w-full">
              <button onClick={() => setActiveTab("personal")} className={`flex-1 py-4 px-4 font-bold text-sm flex items-center justify-center gap-2 border-b-2 whitespace-nowrap ${activeTab === "personal" ? "border-[#3ac47d] text-[#3ac47d] bg-white" : "border-transparent text-slate-500 hover:bg-slate-100"}`}>
                <Users size={16}/> Basic Info
              </button>
              <button onClick={() => setActiveTab("professional")} className={`flex-1 py-4 px-4 font-bold text-sm flex items-center justify-center gap-2 border-b-2 whitespace-nowrap ${activeTab === "professional" ? "border-[#3ac47d] text-[#3ac47d] bg-white" : "border-transparent text-slate-500 hover:bg-slate-100"}`}>
                <Briefcase size={16}/> Professional
              </button>
              <button onClick={() => setActiveTab("education")} className={`flex-1 py-4 px-4 font-bold text-sm flex items-center justify-center gap-2 border-b-2 whitespace-nowrap ${activeTab === "education" ? "border-[#3ac47d] text-[#3ac47d] bg-white" : "border-transparent text-slate-500 hover:bg-slate-100"}`}>
                <GraduationCap size={16}/> Education
              </button>
              <button onClick={() => setActiveTab("financial")} className={`flex-1 py-4 px-4 font-bold text-sm flex items-center justify-center gap-2 border-b-2 whitespace-nowrap ${activeTab === "financial" ? "border-[#3ac47d] text-[#3ac47d] bg-white" : "border-transparent text-slate-500 hover:bg-slate-100"}`}>
                <Wallet size={16}/> Financial
              </button>
            </div>
            <div className="p-4 md:p-8 min-h-[500px] w-full">
              {/* Place your existing form fields here (personal, professional, education, financial) */}
              {/* I'm not repeating them – keep what you already have */}
            </div>
          </div>
        </div>
        <div className="xl:col-span-4 w-full">
           <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-6 w-full">
              <h2 className="text-lg font-black text-[#0F172A] mb-6 uppercase">Directory</h2>
              <div className="space-y-4 h-[500px] overflow-y-auto pr-2 w-full">
                 {staffList.length === 0 ? (
                    <div className="py-10 text-center opacity-50"><Users size={40} className="mx-auto mb-3 text-slate-300"/><p className="font-bold text-sm uppercase">No Staff Added Yet</p></div>
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

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Import Staff (CSV)</h2>
              <button onClick={() => setShowImportModal(false)}><X size={20} /></button>
            </div>
            <p className="text-sm text-slate-500 mb-3">CSV must have header row:<br />
              fullName,fatherName,cnic,dob,gender,email,phone,designation,personnelNo,doj,basicPay,role
            </p>
            <input type="file" accept=".csv" onChange={(e) => setImportFile(e.target.files?.[0] || null)} className="mb-4 w-full" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowImportModal(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
              <button onClick={handleImportCSV} disabled={importing} className="bg-blue-600 text-gray-900 px-4 py-2 rounded-xl flex items-center gap-2">
                {importing ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />} {importing ? "Importing..." : "Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
