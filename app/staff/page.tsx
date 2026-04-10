"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; 
import { useAuth } from "../context/AuthContext";
import { UploadCloud, CheckCircle2, AlertCircle, Image as ImageIcon, Search, User as UserIcon, Edit2, Trash2, FileText, Zap } from "lucide-react";

// تصویر کو Base64 میں بدلنے کا فنکشن (سٹاف کی پروفائل پکچر کے لیے)
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => resolve(fileReader.result as string);
    fileReader.onerror = (error) => reject(error);
  });
};

// CNIC آٹو فارمیٹ
const formatCNIC = (value: string) => {
  const numericValue = value.replace(/\D/g, "");
  if (numericValue.length <= 5) return numericValue;
  if (numericValue.length <= 12) return `${numericValue.slice(0, 5)}-${numericValue.slice(5)}`;
  return `${numericValue.slice(0, 5)}-${numericValue.slice(5, 12)}-${numericValue.slice(12, 13)}`;
};

export default function StaffPage() {
  const router = useRouter(); 
  const { user } = useAuth();
  
  const [schoolCategory, setSchoolCategory] = useState("");
  const [photoBase64, setPhotoBase64] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [staffList, setStaffList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // جامع فارم سٹیٹ (دونوں گورنمنٹ اور پرائیویٹ کے لیے)
  const [formData, setFormData] = useState({
    name: "", cnic: "", phone: "", address: "", gender: "Male",
    designation: "", education: "", experience: "",
    basicPay: "", grossPay: "", netPay: "", deductions: "",
  });

  // سکول کی کیٹیگری اور سٹاف لسٹ لانا
  useEffect(() => {
    const fetchInitData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) setSchoolCategory(userDoc.data().schoolCategory);
      }
    };
    fetchInitData();

    const q = query(collection(db, "staff"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const staffData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStaffList(staffData);
    });
    return () => unsubscribe();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "cnic") {
      setFormData({ ...formData, [name]: formatCNIC(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await convertToBase64(file);
      setPhotoBase64(base64);
    }
  };

  // --- دی میجک: AI سکیننگ اور آٹو فل ---
  const handleAIScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setErrorMsg("");
    try {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = async () => {
        const base64Data = fileReader.result as string;

        // آپ کے OCR API کو کال بھیجی جا رہی ہے
        const response = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            image: base64Data,
            documentType: schoolCategory === "Government" ? "salary_slip" : "cv" 
          })
        });

        const extractedData = await response.json();
        
        // AI کے ڈیٹا کو فارم میں بھریں (آپ کا API جو بھی Keys بھیجے گا، وہ یہاں سیٹ ہوں گی)
        setFormData(prev => ({
          ...prev,
          name: extractedData.name || prev.name,
          cnic: extractedData.cnic ? formatCNIC(extractedData.cnic) : prev.cnic,
          phone: extractedData.phone || prev.phone,
          designation: extractedData.designation || prev.designation,
          basicPay: extractedData.basicPay || prev.basicPay,
          grossPay: extractedData.grossPay || prev.grossPay,
          netPay: extractedData.netPay || prev.netPay,
          deductions: extractedData.deductions || prev.deductions,
          education: extractedData.education || prev.education,
          experience: extractedData.experience || prev.experience,
        }));
        
        alert("AI Scan Complete! Form auto-filled.");
      };
    } catch (error) {
      setErrorMsg("AI Scan failed. Please enter details manually.");
    } finally {
      setIsScanning(false);
    }
  };

  // سٹاف کو سیو کرنا
  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      await addDoc(collection(db, "staff"), {
        ...formData,
        photoBase64,
        schoolCategory,
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setPhotoBase64("");
      setFormData({ name: "", cnic: "", phone: "", address: "", gender: "Male", designation: "", education: "", experience: "", basicPay: "", grossPay: "", netPay: "", deductions: "" });
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      setErrorMsg("Failed to save staff data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    if (window.confirm("Delete this staff member?")) {
      await deleteDoc(doc(db, "staff", id));
    }
  };

  const handleViewProfile = (id: string) => {
    router.push(`/staff-profile?id=${id}`);
  };

  const filteredStaff = staffList.filter(staff => 
    staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) || staff.cnic?.includes(searchTerm)
  );

  return (
    <div className="animate-fade-in space-y-6">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Manage Staff</h1>
        <p className="text-sm text-slate-500 mt-1">Add staff using AI Document Scanner or enter manually.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI SCANNER BOX */}
          <div className="bg-gradient-to-r from-[#1e9a5d] to-[#3ac47d] rounded-3xl p-6 shadow-lg shadow-[#3ac47d]/20 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"><Zap size={28} className="text-white" /></div>
              <div>
                <h3 className="font-bold text-lg">{schoolCategory === "Government" ? "Salary Slip Auto-Fill" : "CV / Resume Auto-Fill"}</h3>
                <p className="text-sm text-white/80">Upload document and let AI extract the details magically.</p>
              </div>
            </div>
            <div className="relative shrink-0">
              <button disabled={isScanning} className="bg-white text-[#1e9a5d] hover:bg-slate-50 px-6 py-3 rounded-xl font-extrabold shadow-sm transition-all disabled:opacity-70 flex items-center gap-2">
                {isScanning ? "Scanning..." : <><FileText size={18} /> Upload & Scan</>}
              </button>
              <input type="file" accept="image/*,application/pdf" onChange={handleAIScan} disabled={isScanning} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            {success && <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3"><CheckCircle2 size={20} /> <span className="font-medium text-sm">Staff saved successfully!</span></div>}
            {errorMsg && <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3"><AlertCircle size={20} /> <span className="font-medium text-sm">{errorMsg}</span></div>}

            <form onSubmit={handleSaveStaff} className="space-y-8">
              
              <section>
                <h3 className="text-[11px] font-bold text-[#3ac47d] uppercase tracking-widest mb-4">Personal Identity</h3>
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="relative group shrink-0">
                    <div className="w-28 h-28 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-[#3ac47d]">
                      {photoBase64 ? <img src={photoBase64} alt="Preview" className="w-full h-full object-cover" /> : <><ImageIcon size={24} className="text-slate-400 mb-1" /><span className="text-[10px] text-slate-400">Staff Photo</span></>}
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>

                  <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input required name="name" value={formData.name} onChange={handleInputChange} type="text" placeholder="Full Name" className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#3ac47d]/50 border border-slate-100" />
                    <input required name="cnic" value={formData.cnic} onChange={handleInputChange} type="text" placeholder="CNIC (00000-0000000-0)" maxLength={15} className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#3ac47d]/50 border border-slate-100" />
                    <input required name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="Phone Number" className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#3ac47d]/50 border border-slate-100" />
                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm border border-slate-100"><option>Male</option><option>Female</option></select>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[11px] font-bold text-[#3ac47d] uppercase tracking-widest mb-4">Professional Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input required name="designation" value={formData.designation} onChange={handleInputChange} type="text" placeholder="Designation (e.g. Teacher)" className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm border border-slate-100 focus:ring-2 focus:ring-[#3ac47d]/50" />
                  <input name="education" value={formData.education} onChange={handleInputChange} type="text" placeholder="Education (e.g. MA, B.Ed)" className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm border border-slate-100 focus:ring-2 focus:ring-[#3ac47d]/50" />
                  <input name="experience" value={formData.experience} onChange={handleInputChange} type="text" placeholder="Experience (e.g. 5 Years)" className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm border border-slate-100 focus:ring-2 focus:ring-[#3ac47d]/50" />
                </div>
              </section>

              {/* مالیاتی سیکشن (Financials) - جو سیلری سلپ سے بھرے گا */}
              <section>
                <h3 className="text-[11px] font-bold text-[#3ac47d] uppercase tracking-widest mb-4">Financials (Pay & Allowances)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <input name="basicPay" value={formData.basicPay} onChange={handleInputChange} type="number" placeholder="Basic Pay (Rs)" className="w-full bg-[#f0fdf4] outline-none rounded-xl px-4 py-3 text-sm border border-green-100 text-green-700" />
                  <input name="grossPay" value={formData.grossPay} onChange={handleInputChange} type="number" placeholder="Gross Pay" className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm border border-slate-100" />
                  <input name="deductions" value={formData.deductions} onChange={handleInputChange} type="number" placeholder="Deductions" className="w-full bg-red-50/50 outline-none rounded-xl px-4 py-3 text-sm border border-red-100 text-red-600" />
                  <input name="netPay" value={formData.netPay} onChange={handleInputChange} type="number" placeholder="Net Pay" className="w-full bg-blue-50/50 outline-none rounded-xl px-4 py-3 text-sm border border-blue-100 text-blue-700 font-bold" />
                </div>
              </section>

              <div className="pt-4 flex justify-end">
                <button disabled={loading} type="submit" className="bg-[#0F172A] hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl font-bold shadow-md transition-all disabled:opacity-70 flex items-center gap-2">
                  {loading ? "Saving..." : <><UploadCloud size={18} /> Save Staff Member</>}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Directory */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full max-h-[800px] flex flex-col">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-lg font-bold text-slate-800">Staff Directory</h2>
               <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-lg">{staffList.length}</span>
             </div>
             
             <div className="bg-slate-50 rounded-xl px-4 py-3 mb-4 flex items-center gap-3 border border-slate-100 shrink-0">
               <Search size={16} className="text-slate-400" />
               <input type="text" placeholder="Search staff..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400" />
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
               {filteredStaff.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-48 text-center opacity-60">
                   <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3"><span className="text-xl">📂</span></div>
                   <p className="text-sm font-medium text-slate-500">No staff found.</p>
                 </div>
               ) : (
                 filteredStaff.map((staff) => (
                   <div key={staff.id} onClick={() => handleViewProfile(staff.id)} className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-[#f0fdf4] hover:border-[#3ac47d]/30 transition-all rounded-xl border border-slate-100/50 cursor-pointer group relative">
                     <div className="w-12 h-12 rounded-full bg-white border border-slate-200 overflow-hidden shrink-0">
                       {staff.photoBase64 ? <img src={staff.photoBase64} alt={staff.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100"><UserIcon size={20} /></div>}
                     </div>
                     <div className="flex-1 min-w-0 pr-12">
                       <p className="text-sm font-bold text-slate-800 truncate group-hover:text-[#3ac47d] transition-colors">{staff.name}</p>
                       <p className="text-[11px] text-slate-500 truncate mt-0.5">{staff.designation} • {staff.phone}</p>
                     </div>
                     
                     <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); alert("Edit function active soon!"); }} className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-md"><Edit2 size={14} /></button>
                        <button onClick={(e) => handleDelete(e, staff.id)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-md"><Trash2 size={14} /></button>
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
