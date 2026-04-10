"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; 
import { useAuth } from "../context/AuthContext";
import { UploadCloud, CheckCircle2, AlertCircle, Image as ImageIcon, Search, User as UserIcon, Edit2, Trash2, FileText, Zap, Paperclip } from "lucide-react";

// Helper Functions
const convertToBase64 = (file: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => resolve(fileReader.result as string);
    fileReader.onerror = (error) => reject(error);
  });
};

const formatCNIC = (value: string) => {
  const numericValue = value.replace(/\D/g, "");
  if (numericValue.length <= 5) return numericValue;
  if (numericValue.length <= 12) return `${numericValue.slice(0, 5)}-${numericValue.slice(5)}`;
  return `${numericValue.slice(0, 5)}-${numericValue.slice(5, 12)}-${numericValue.slice(12, 13)}`;
};

export default function StaffPage() {
  const router = useRouter(); 
  const { user } = useAuth();
  
  // VERCEL BYPASS: SSR Prerendering Killer
  const [isMounted, setIsMounted] = useState(false);
  
  const [schoolCategory, setSchoolCategory] = useState("");
  const [photoBase64, setPhotoBase64] = useState<string>("");
  const [documentBase64, setDocumentBase64] = useState<string>(""); 
  const [documentName, setDocumentName] = useState<string>("");

  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [staffList, setStaffList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "", cnic: "", phone: "", email: "", dob: "", gender: "Male",
    personnelNo: "", scale: "", employmentCategory: "", designation: "", education: "", experience: "",
    bankAccount: "", basicPay: "", grossPay: "", netPay: "", deductionsTotal: "",
    allowances: [], deductionsList: [] 
  });

  useEffect(() => {
    setIsMounted(true); // یہ Vercel کو بتائے گا کہ پیج براؤزر میں آ چکا ہے
    
    const fetchInitData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) setSchoolCategory(userDoc.data().schoolCategory);
      }
    };
    fetchInitData();

    const q = query(collection(db, "staff"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStaffList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === "cnic" ? formatCNIC(value) : value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setPhotoBase64(await convertToBase64(e.target.files[0]));
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("File too large. Max 2MB allowed.");
      setDocumentName(file.name);
      setDocumentBase64(await convertToBase64(file));
    }
  };

  const handleAIScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setErrorMsg("");
    try {
      const base64Data = await convertToBase64(file);
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data, documentType: schoolCategory === "Government" ? "salary_slip" : "cv" })
      });
      
      const extractedData = await response.json();
      
      setFormData(prev => ({
        ...prev,
        name: extractedData.name || prev.name,
        cnic: extractedData.cnic ? formatCNIC(extractedData.cnic) : prev.cnic,
        email: extractedData.email || prev.email,
        dob: extractedData.dob || prev.dob,
        personnelNo: extractedData.personnelNo || prev.personnelNo,
        scale: extractedData.scale || prev.scale,
        employmentCategory: extractedData.employmentCategory || prev.employmentCategory,
        designation: extractedData.designation || prev.designation,
        bankAccount: extractedData.bankAccount || prev.bankAccount,
        basicPay: extractedData.basicPay || prev.basicPay,
        grossPay: extractedData.grossPay || prev.grossPay,
        netPay: extractedData.netPay || prev.netPay,
        deductionsTotal: extractedData.deductionsTotal || prev.deductionsTotal,
        education: extractedData.education || prev.education,
        experience: extractedData.experience || prev.experience,
        allowances: extractedData.allowances || prev.allowances,
        deductionsList: extractedData.deductionsList || prev.deductionsList,
      }));
      
      alert("AI Scan Complete! All details extracted and auto-filled.");
    } catch (error) {
      setErrorMsg("AI Scan failed. Please enter details manually.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "staff"), {
        ...formData, photoBase64, documentBase64, documentName, schoolCategory, createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setTimeout(() => window.location.reload(), 1500); 
    } catch (error) {
      setErrorMsg("Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    if (window.confirm("Delete this staff member?")) await deleteDoc(doc(db, "staff", id));
  };

  // اگر پیج سرور پر ہے، تو اسے بالکل خالی دکھاؤ تاکہ Vercel کریش نہ ہو
  if (!isMounted) return null;

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <div><h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Manage Staff</h1></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-gradient-to-r from-[#1e9a5d] to-[#3ac47d] rounded-3xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center"><Zap size={28} /></div>
              <div><h3 className="font-bold text-lg">AI Auto-Extract</h3><p className="text-sm opacity-80">Upload Slip/CV to extract all details magically.</p></div>
            </div>
            <div className="relative shrink-0">
              <button disabled={isScanning} className="bg-white text-[#1e9a5d] hover:bg-slate-50 px-6 py-3 rounded-xl font-extrabold shadow-sm flex items-center gap-2">
                {isScanning ? "Scanning..." : <><FileText size={18} /> Upload & Scan</>}
              </button>
              <input type="file" accept="image/*,application/pdf" onChange={handleAIScan} disabled={isScanning} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            {success && <div className="mb-4 bg-green-50 text-green-700 p-4 rounded-xl flex gap-3"><CheckCircle2/> Staff saved!</div>}
            
            <form onSubmit={handleSaveStaff} className="space-y-8">
              
              <section>
                <h3 className="text-[11px] font-bold text-[#3ac47d] uppercase tracking-widest mb-4">Personal Identity</h3>
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="w-28 h-28 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative hover:border-[#3ac47d] overflow-hidden">
                    {photoBase64 ? <img src={photoBase64} className="w-full h-full object-cover" /> : <span className="text-[10px] text-slate-400">Photo</span>}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input required name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                    <input required name="cnic" value={formData.cnic} onChange={handleInputChange} placeholder="CNIC" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                    <input name="dob" type="date" value={formData.dob} onChange={handleInputChange} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border text-slate-500" />
                    <input name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[11px] font-bold text-[#3ac47d] uppercase tracking-widest mb-4">Professional Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input name="personnelNo" value={formData.personnelNo} onChange={handleInputChange} placeholder="Personnel No" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                  <input name="scale" value={formData.scale} onChange={handleInputChange} placeholder="BPS Scale" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                  <input name="employmentCategory" value={formData.employmentCategory} onChange={handleInputChange} placeholder="Emp. Category" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                  <input required name="designation" value={formData.designation} onChange={handleInputChange} placeholder="Designation" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                  <input name="education" value={formData.education} onChange={handleInputChange} placeholder="Education" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                  <input name="experience" value={formData.experience} onChange={handleInputChange} placeholder="Experience" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                </div>
              </section>

              <section>
                <h3 className="text-[11px] font-bold text-[#3ac47d] uppercase tracking-widest mb-4">Financials & Documents</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <input name="basicPay" value={formData.basicPay} onChange={handleInputChange} placeholder="Basic Pay" className="w-full bg-[#f0fdf4] outline-none rounded-xl px-4 py-3 text-sm border border-green-100 text-green-700" />
                  <input name="netPay" value={formData.netPay} onChange={handleInputChange} placeholder="Net Pay" className="w-full bg-blue-50 outline-none rounded-xl px-4 py-3 text-sm border border-blue-100 text-blue-700 font-bold" />
                </div>
                
                <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 hover:border-[#3ac47d] transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-lg text-slate-500"><Paperclip size={20}/></div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">Attach Document</p>
                      <p className="text-xs text-slate-400">{documentName || "Upload original CV or Salary Slip (PDF/Image)"}</p>
                    </div>
                  </div>
                  <input type="file" accept=".pdf,image/*" onChange={handleDocumentUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                </div>
              </section>

              <button disabled={loading} type="submit" className="w-full bg-[#0F172A] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                {loading ? "Saving..." : "Save Complete Profile"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full max-h-[800px] flex flex-col">
             <h2 className="text-lg font-bold mb-4">Staff Directory</h2>
             <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
               {staffList.map((staff) => (
                 <div key={staff.id} onClick={() => router.push(`/staff-profile?id=${staff.id}`)} className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-[#f0fdf4] transition-all rounded-xl cursor-pointer">
                   <div className="w-10 h-10 rounded-full bg-white overflow-hidden shrink-0">
                     {staff.photoBase64 ? <img src={staff.photoBase64} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><UserIcon size={16} /></div>}
                   </div>
                   <div className="flex-1 min-w-0 pr-8">
                     <p className="text-sm font-bold text-slate-800 truncate">{staff.name}</p>
                     <p className="text-[11px] text-slate-500 truncate">{staff.designation}</p>
                   </div>
                   <button onClick={(e) => handleDelete(e, staff.id)} className="text-red-500 hover:bg-red-100 p-1 rounded-md"><Trash2 size={14} /></button>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
