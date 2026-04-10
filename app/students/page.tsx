"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase"; 
import { UploadCloud, CheckCircle2, AlertCircle, Image as ImageIcon, Search, User as UserIcon, Edit2, Trash2 } from "lucide-react";

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

  useEffect(() => {
    setIsMounted(true);
    const q = query(collection(db, "students"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStudentsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Section کو ہمیشہ کیپیٹل (Capital) میں سیو کریں تاکہ ڈیٹا بیس میں گڑبڑ نہ ہو
    if (name === "section") {
      setFormData({ ...formData, [name]: value.toUpperCase() });
    } else if (name === "idNumber") {
      setFormData({ ...formData, [name]: formatCNIC(value) });
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
      await addDoc(collection(db, "students"), {
        ...formData,
        photoBase64,
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setPhotoBase64("");
      setFormData({ name: "", idNumber: "", dob: "", gender: "Male", religion: "Islam", fatherName: "", fatherProfession: "", phone: "", address: "", admissionDate: "", rollNumber: "", classGrade: "", section: "" });
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setErrorMsg("Failed to save student.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    if (window.confirm("Delete this student?")) await deleteDoc(doc(db, "students", id));
  };

  if (!isMounted) return null;

  const filteredStudents = studentsList.filter(student => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber?.toString().includes(searchTerm) ||
    student.idNumber?.includes(searchTerm)
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div><h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Manage Students</h1></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          {success && <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3"><CheckCircle2 /> Student saved!</div>}
          {errorMsg && <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3"><AlertCircle /> {errorMsg}</div>}

          <form onSubmit={handleSaveStudent} className="space-y-8">
            <section>
              <h3 className="text-[11px] font-bold text-[#3ac47d] uppercase tracking-widest mb-4">Basic Identity</h3>
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="relative group shrink-0 w-28 h-28 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden hover:border-[#3ac47d]">
                  {photoBase64 ? <img src={photoBase64} className="w-full h-full object-cover" /> : <><ImageIcon className="text-slate-400 mb-1" /><span className="text-[10px] text-slate-400">Photo</span></>}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                  <input required name="idNumber" value={formData.idNumber} onChange={handleInputChange} placeholder="CNIC (00000-0000000-0)" maxLength={15} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                  <input required name="dob" value={formData.dob} onChange={handleInputChange} type="date" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border text-slate-500" />
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border text-slate-700"><option>Male</option><option>Female</option></select>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[11px] font-bold text-[#3ac47d] uppercase tracking-widest mb-4">Contact Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required name="fatherName" value={formData.fatherName} onChange={handleInputChange} placeholder="Father's Name" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                <input required name="fatherProfession" value={formData.fatherProfession} onChange={handleInputChange} placeholder="Father's Profession" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                <input required name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="Phone Number" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
                <input required name="address" value={formData.address} onChange={handleInputChange} placeholder="Address" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
              </div>
            </section>

            <section>
              <h3 className="text-[11px] font-bold text-[#3ac47d] uppercase tracking-widest mb-4">School Placement</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <input required name="admissionDate" value={formData.admissionDate} onChange={handleInputChange} type="date" className="sm:col-span-2 w-full bg-[#f0fdf4] outline-none rounded-xl px-4 py-3 text-sm border border-green-100 text-green-700" />
                
                {/* 11 اور 12 نکال دیے گئے */}
                <select required name="classGrade" value={formData.classGrade} onChange={handleInputChange} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border text-slate-700">
                  <option value="" disabled>Select Class</option>
                  {["Playgroup", "Nursery", "Prep", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                {/* Section اب مینول (Manual) ہے */}
                <input required name="section" value={formData.section} onChange={handleInputChange} type="text" placeholder="Section (e.g. A, IQBAL)" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border uppercase" />
                <input required name="rollNumber" value={formData.rollNumber} onChange={handleInputChange} type="number" placeholder="Roll No" className="sm:col-span-2 w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border" />
              </div>
            </section>

            <div className="pt-4 flex justify-end">
              <button disabled={loading} type="submit" className="bg-[#3ac47d] text-white px-8 py-3.5 rounded-xl font-bold flex gap-2">{loading ? "Saving..." : <><UploadCloud size={18} /> Save Student</>}</button>
            </div>
          </form>
        </div>

        {/* Directory */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full max-h-[800px] flex flex-col">
             <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold">Directory</h2><span className="bg-slate-100 px-2 py-1 rounded-lg font-bold text-xs">{studentsList.length}</span></div>
             <div className="bg-slate-50 rounded-xl px-4 py-3 mb-4 flex items-center gap-3 border"><Search size={16} className="text-slate-400" /><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent outline-none text-sm w-full" /></div>
             <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
               {filteredStudents.map((student) => (
                 <div key={student.id} onClick={() => router.push(`/student-profile?id=${student.id}`)} className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-[#f0fdf4] rounded-xl cursor-pointer group relative">
                   <div className="w-12 h-12 rounded-full bg-white overflow-hidden shrink-0">{student.photoBase64 ? <img src={student.photoBase64} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400"><UserIcon size={20} /></div>}</div>
                   <div className="flex-1 min-w-0 pr-12">
                     <p className="text-sm font-bold truncate group-hover:text-[#3ac47d]">{student.name}</p>
                     <p className="text-[11px] text-slate-500 truncate">Roll: {student.rollNumber} • {student.classGrade} {student.section && `- ${student.section}`}</p>
                   </div>
                   <div className="absolute right-3 opacity-0 group-hover:opacity-100 flex gap-1">
                      <button onClick={(e) => handleDelete(e, student.id)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-md"><Trash2 size={14} /></button>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
