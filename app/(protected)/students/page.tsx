"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, CheckCircle2, AlertCircle, Image as ImageIcon, Search, User as UserIcon, Trash2, Loader2 } from "lucide-react";

const convertToBase64 = (file: File): Promise<string> => {
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

export default function StudentsPage() {
  const router = useRouter(); 
  const [isMounted, setIsMounted] = useState(false);
  const [role, setRole] = useState<string>("loading"); 
  
  const [photoBase64, setPhotoBase64] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // 👉 1. DYNAMIC DROPDOWNS STATE
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [availableSections, setAvailableSections] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "", idNumber: "", dob: "", gender: "Male", religion: "Islam",
    fatherName: "", fatherProfession: "", phone: "", address: "",
    admissionDate: "", rollNumber: "", classGrade: "", section: ""
  });

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/students", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setStudentsList(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    } catch (error) {
      console.error("Failed to fetch students");
    }
  };

  useEffect(() => {
    setIsMounted(true);
    
    // رول چیک کریں
    fetch("/api/users/get", { credentials: "include" })
      .then(res => res.json())
      .then(data => setRole(data.role || "teacher"))
      .catch(() => setRole("teacher"));
      
    // سٹوڈنٹس کا ڈیٹا منگوائیں
    fetchStudents();

    // 👉 2. THE MAGIC: ایڈمن سیٹنگز سے کلاسز اور سیکشنز منگوائیں
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/settings", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setAvailableClasses(data[0].classes || []);
            setAvailableSections(data[0].sections || []);
          }
        }
      } catch (error) {
         console.error("Failed to load settings config");
      }
    };
    fetchConfig();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "section") {
      setFormData({ ...formData, [name]: value.toUpperCase() });
    } else if (name === "idNumber") {
      setFormData({ ...formData, [name]: formatCNIC(value) });
    } else if (name === "classGrade") {
      // 💡 UX Improvement: جب کلاس بدلے تو پرانا سیکشن خالی کر دو
      setFormData({ ...formData, [name]: value, section: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) return setErrorMsg("Image too large! Max 500KB.");
      setErrorMsg("");
      setPhotoBase64(await convertToBase64(file));
    }
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccess(false);

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, photoBase64 }),
        credentials: "include"
      });

      if (!response.ok) {
         throw new Error("Failed to save via API");
      }

      setSuccess(true);
      setPhotoBase64("");
      setFormData({ name: "", idNumber: "", dob: "", gender: "Male", religion: "Islam", fatherName: "", fatherProfession: "", phone: "", address: "", admissionDate: "", rollNumber: "", classGrade: "", section: "" });
      
      fetchStudents();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setErrorMsg("Failed to save student. Ensure you have the right permissions.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    if (role !== "admin") {
      alert("Only Administrators can delete student records.");
      return;
    }
    if (window.confirm("Delete this student? API integration pending.")) {
      // await fetch(`/api/students?id=${id}`, { method: "DELETE" });
      // fetchStudents();
    }
  };

  if (!isMounted) return null;

  const filteredStudents = studentsList.filter(student => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber?.toString().includes(searchTerm) ||
    student.idNumber?.includes(searchTerm)
  );

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight uppercase">Manage Students</h1>
        <p className="text-sm text-slate-500 mt-1">Tenant-Isolated Student Directory</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          {success && <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 font-bold uppercase tracking-widest"><CheckCircle2 /> Student saved!</div>}
          {errorMsg && <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 font-bold"><AlertCircle /> {errorMsg}</div>}

          <form onSubmit={handleSaveStudent} className="space-y-8">
            <section>
              <h3 className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-4">Basic Identity</h3>
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="relative group shrink-0 w-28 h-28 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden hover:border-blue-500">
                  {photoBase64 ? <img src={photoBase64} className="w-full h-full object-cover" /> : <><ImageIcon className="text-slate-400 mb-1" /><span className="text-[10px] text-slate-400">Photo</span></>}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm font-bold border focus:border-blue-500 uppercase" />
                  <input required name="idNumber" value={formData.idNumber} onChange={handleInputChange} placeholder="CNIC (00000-0000000-0)" maxLength={15} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm font-bold border focus:border-blue-500" />
                  <input required name="dob" value={formData.dob} onChange={handleInputChange} type="date" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm font-bold border text-slate-500 focus:border-blue-500" />
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm font-bold border text-slate-700 focus:border-blue-500 uppercase"><option>Male</option><option>Female</option></select>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-4">Contact Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required name="fatherName" value={formData.fatherName} onChange={handleInputChange} placeholder="Father's Name" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm font-bold border focus:border-blue-500 uppercase" />
                <input required name="fatherProfession" value={formData.fatherProfession} onChange={handleInputChange} placeholder="Father's Profession" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm font-bold border focus:border-blue-500 uppercase" />
                <input required name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="Phone Number" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm font-bold border focus:border-blue-500" />
                <input required name="address" value={formData.address} onChange={handleInputChange} placeholder="Address" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm font-bold border focus:border-blue-500 uppercase" />
              </div>
            </section>

            {/* 👉 3. SMART DYNAMIC DROPDOWNS FOR SCHOOL PLACEMENT */}
            <section>
              <h3 className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-4">School Placement</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <input required name="admissionDate" value={formData.admissionDate} onChange={handleInputChange} type="date" className="sm:col-span-2 w-full bg-blue-50 outline-none rounded-xl px-4 py-3 text-sm font-bold border border-blue-100 text-blue-700 focus:border-blue-500" />
                
                <select required name="classGrade" value={formData.classGrade} onChange={handleInputChange} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm font-bold border text-slate-700 focus:border-blue-500 uppercase">
                  <option value="" disabled>Select Class</option>
                  {availableClasses.length === 0 ? (
                     <option disabled>No classes found in settings</option>
                  ) : (
                     availableClasses.map(c => <option key={c} value={c}>{c}</option>)
                  )}
                </select>

                <select required name="section" value={formData.section} onChange={handleInputChange} disabled={!formData.classGrade} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm font-bold border uppercase focus:border-blue-500 disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed">
                   <option value="" disabled>Select Section</option>
                   {availableSections
                      .filter(s => s.class === formData.classGrade)
                      .map((s, idx) => <option key={idx} value={s.name}>{s.name}</option>)
                   }
                </select>
                
                <input required name="rollNumber" value={formData.rollNumber} onChange={handleInputChange} type="number" placeholder="Roll No" className="sm:col-span-2 w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm font-bold border focus:border-blue-500" />
              </div>
            </section>

            <div className="pt-4 flex justify-end">
              <button disabled={loading} type="submit" className="bg-[#0F172A] text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-colors shadow-lg disabled:opacity-50 w-full sm:w-auto justify-center">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <><UploadCloud size={18} /> Save Record</>}
              </button>
            </div>
          </form>
        </div>

        {/* Directory Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full max-h-[800px] flex flex-col">
             <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-black uppercase text-[#0F172A]">Directory</h2><span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-black text-xs">{studentsList.length}</span></div>
             <div className="bg-slate-50 rounded-xl px-4 py-3 mb-4 flex items-center gap-3 border"><Search size={16} className="text-slate-400" /><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent outline-none text-sm w-full font-bold uppercase" /></div>
             <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
               {studentsList.length === 0 ? (
                 <div className="text-center text-slate-400 py-10 font-bold text-sm uppercase">Loading or Empty...</div>
               ) : filteredStudents.map((student) => (
                 <div key={student.id} onClick={() => router.push(`/student-profile?id=${student.id}`)} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 hover:border-blue-300 rounded-2xl cursor-pointer group relative transition-colors">
                   <div className="w-12 h-12 rounded-full bg-white overflow-hidden shrink-0 border border-slate-200">{student.photoBase64 ? <img src={student.photoBase64} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300"><UserIcon size={20} /></div>}</div>
                   <div className="flex-1 min-w-0 pr-12">
                     <p className="text-sm font-black text-[#0F172A] truncate group-hover:text-blue-600 uppercase">{student.name}</p>
                     <p className="text-[10px] font-bold text-slate-500 truncate uppercase tracking-widest mt-0.5">Roll: {student.rollNumber} • {student.classGrade} {student.section && `- ${student.section}`}</p>
                   </div>
                   
                   {role === "admin" && (
                     <div className="absolute right-3 opacity-0 group-hover:opacity-100 flex gap-1">
                        <button onClick={(e) => handleDelete(e, student.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 size={14} /></button>
                     </div>
                   )}
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
