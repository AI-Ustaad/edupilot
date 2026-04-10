"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // <-- فائر بیس کا پاتھ بالکل ٹھیک کر دیا گیا ہے
import { UploadCloud, CheckCircle2, AlertCircle, Image as ImageIcon, Search, User as UserIcon, Edit2, Trash2 } from "lucide-react";

// تصویر کو Base64 میں بدلنے کا فنکشن
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => resolve(fileReader.result as string);
    fileReader.onerror = (error) => reject(error);
  });
};

// پاکستانی CNIC / B-Form کو آٹو فارمیٹ کرنے کا فنکشن (00000-0000000-0)
const formatCNIC = (value: string) => {
  const numericValue = value.replace(/\D/g, "");
  if (numericValue.length <= 5) return numericValue;
  if (numericValue.length <= 12) return `${numericValue.slice(0, 5)}-${numericValue.slice(5)}`;
  return `${numericValue.slice(0, 5)}-${numericValue.slice(5, 12)}-${numericValue.slice(12, 13)}`;
};

export default function StudentsPage() {
  const router = useRouter(); 
  const [photoBase64, setPhotoBase64] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "", idNumber: "", dob: "", gender: "Male", religion: "Islam",
    fatherName: "", fatherProfession: "", phone: "", address: "",
    admissionDate: "", rollNumber: "", classGrade: "", section: ""
  });

  // فائر بیس سے سٹوڈنٹس کا ڈیٹا لائیو لانا
  useEffect(() => {
    const q = query(collection(db, "students"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudentsList(studentsData);
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "idNumber") {
      setFormData({ ...formData, [name]: formatCNIC(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        setErrorMsg("Image is too large! Please select an image under 500KB.");
        return;
      }
      setErrorMsg("");
      try {
        const base64 = await convertToBase64(file);
        setPhotoBase64(base64);
      } catch (err) {
        setErrorMsg("Failed to process image.");
      }
    }
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccess(false);

    try {
      const studentRecord = {
        ...formData,
        photoBase64: photoBase64,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "students"), studentRecord);

      setSuccess(true);
      setPhotoBase64("");
      setFormData({
        name: "", idNumber: "", dob: "", gender: "Male", religion: "Islam",
        fatherName: "", fatherProfession: "", phone: "", address: "",
        admissionDate: "", rollNumber: "", classGrade: "", section: ""
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      setErrorMsg("Failed to save student data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteDoc(doc(db, "students", id));
      } catch (error) {
        alert("Failed to delete student.");
      }
    }
  };

  const handleViewProfile = (id: string) => {
    router.push(`/student-profile?id=${id}`);
  };

  const filteredStudents = studentsList.filter(student => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber?.includes(searchTerm) ||
    student.idNumber?.includes(searchTerm)
  );

  return (
    <div className="animate-fade-in space-y-6">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Manage Students</h1>
        <p className="text-sm text-slate-500 mt-1">Add new students and view recent admissions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          
          {success && (
            <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-100">
              <CheckCircle2 size={20} className="text-green-500" />
              <span className="font-medium text-sm">Student saved successfully!</span>
            </div>
          )}
          {errorMsg && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
              <AlertCircle size={20} className="text-red-500" />
              <span className="font-medium text-sm">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveStudent} className="space-y-8">
            <section>
              <h3 className="text-[11px] font-bold text-[#3ac47d] uppercase tracking-widest mb-4">Basic Identity</h3>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="relative group shrink-0">
                  <div className="w-28 h-28 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-[#3ac47d]">
                    {photoBase64 ? (
                      <img src={photoBase64} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon size={24} className="text-slate-400 mb-1" />
                        <span className="text-[10px] text-slate-400">Upload Photo</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>

                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required name="name" value={formData.name} onChange={handleInputChange} type="text" placeholder="Full Name" className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50 border border-slate-100" />
                  <input required name="idNumber" value={formData.idNumber} onChange={handleInputChange} type="text" placeholder="CNIC / B-Form (00000-0000000-0)" maxLength={15} className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50 border border-slate-100" />
                  <input required name="dob" value={formData.dob} onChange={handleInputChange} type="date" className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50 border border-slate-100 text-slate-500" />
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50 border border-slate-100 text-slate-700">
                    <option>Male</option><option>Female</option>
                  </select>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[11px] font-bold text-[#3ac47d] uppercase tracking-widest mb-4">Family & Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required name="fatherName" value={formData.fatherName} onChange={handleInputChange} type="text" placeholder="Father's Name" className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm border border-slate-100 focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50" />
                <input required name="fatherProfession" value={formData.fatherProfession} onChange={handleInputChange} type="text" placeholder="Father's Profession" className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm border border-slate-100 focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50" />
                <input required name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="Phone Number" className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm border border-slate-100 focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50" />
                <input required name="address" value={formData.address} onChange={handleInputChange} type="text" placeholder="Home Address" className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm border border-slate-100 focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50" />
              </div>
            </section>

            <section>
              <h3 className="text-[11px] font-bold text-[#3ac47d] uppercase tracking-widest mb-4">School Placement</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <input required name="admissionDate" value={formData.admissionDate} onChange={handleInputChange} type="date" className="sm:col-span-2 w-full bg-[#f0fdf4] outline-none rounded-xl px-4 py-3 text-sm border border-green-100 focus:ring-2 focus:ring-[#3ac47d]/50 text-green-700" />
                <input required name="classGrade" value={formData.classGrade} onChange={handleInputChange} type="text" placeholder="Class (e.g. 9th)" className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm border border-slate-100 focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50" />
                <input name="section" value={formData.section} onChange={handleInputChange} type="text" placeholder="Section (A, B)" className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm border border-slate-100 focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50" />
                <input required name="rollNumber" value={formData.rollNumber} onChange={handleInputChange} type="number" placeholder="Roll No. (e.g. 15)" className="sm:col-span-2 w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm border border-slate-100 focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50" />
              </div>
            </section>

            <div className="pt-4 flex justify-end">
              <button disabled={loading} type="submit" className="bg-[#3ac47d] hover:bg-[#2eaa6a] text-white px-8 py-3.5 rounded-xl font-bold shadow-md transition-all disabled:opacity-70 flex items-center gap-2">
                {loading ? "Saving..." : <><UploadCloud size={18} /> Save Student</>}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Directory */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full max-h-[800px] flex flex-col">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-lg font-bold text-slate-800">Directory</h2>
               <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-lg">{studentsList.length}</span>
             </div>
             
             <div className="bg-slate-50 rounded-xl px-4 py-3 mb-4 flex items-center gap-3 border border-slate-100 shrink-0">
               <Search size={16} className="text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search name, roll, CNIC..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400" 
               />
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
               {filteredStudents.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-48 text-center opacity-60">
                   <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                     <span className="text-xl">📂</span>
                   </div>
                   <p className="text-sm font-medium text-slate-500">No students found.</p>
                 </div>
               ) : (
                 filteredStudents.map((student) => (
                   <div 
                     key={student.id} 
                     onClick={() => handleViewProfile(student.id)} 
                     className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-[#f0fdf4] hover:border-[#3ac47d]/30 transition-all rounded-xl border border-slate-100/50 cursor-pointer group relative"
                   >
                     <div className="w-12 h-12 rounded-full bg-white border border-slate-200 overflow-hidden shrink-0">
                       {student.photoBase64 ? (
                         <img src={student.photoBase64} alt={student.name} className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                           <UserIcon size={20} />
                         </div>
                       )}
                     </div>
                     <div className="flex-1 min-w-0 pr-12">
                       <p className="text-sm font-bold text-slate-800 truncate group-hover:text-[#3ac47d] transition-colors">{student.name}</p>
                       <p className="text-[11px] text-slate-500 truncate mt-0.5">
                         Roll: {student.rollNumber} • Class {student.classGrade} {student.section}
                       </p>
                     </div>
                     
                     <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); alert("Edit function coming soon!"); }} className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-md transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={(e) => handleDelete(e, student.id)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors">
                          <Trash2 size={14} />
                        </button>
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
