"use client";
import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase"; // یقین کر لیں کہ یہ پاتھ آپ کی ایپ کے مطابق بالکل ٹھیک ہے
import { UploadCloud, CheckCircle2, AlertCircle, Image as ImageIcon } from "lucide-react";

// --- 1. Base64 Converter Function ---
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => resolve(fileReader.result as string);
    fileReader.onerror = (error) => reject(error);
  });
};

export default function StudentsPage() {
  // --- 2. States for Form Data ---
  const [photoBase64, setPhotoBase64] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    idNumber: "",
    dob: "",
    gender: "Male",
    religion: "Islam",
    fatherName: "",
    fatherProfession: "",
    phone: "",
    address: "",
    admissionDate: "",
    rollNumber: "",
    classGrade: "",
  });

  // --- 3. Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Firestore document limit is 1MB. So we restrict image size to 500KB max.
      if (file.size > 500 * 1024) {
        setErrorMsg("Image is too large! Please select an image under 500KB.");
        return;
      }
      setErrorMsg("");
      try {
        const base64 = await convertToBase64(file);
        setPhotoBase64(base64);
      } catch (err) {
        setErrorMsg("Failed to process image. Try another one.");
      }
    }
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccess(false);

    try {
      // Data to save in Firestore
      const studentRecord = {
        ...formData,
        photoBase64: photoBase64, // Image is saved as text!
        createdAt: serverTimestamp(),
      };

      // Save directly to Firestore "students" collection
      await addDoc(collection(db, "students"), studentRecord);

      // Success! Reset the form
      setSuccess(true);
      setPhotoBase64("");
      setFormData({
        name: "", idNumber: "", dob: "", gender: "Male", religion: "Islam",
        fatherName: "", fatherProfession: "", phone: "", address: "",
        admissionDate: "", rollNumber: "", classGrade: ""
      });

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

    } catch (error: any) {
      console.error("Firestore Error:", error);
      setErrorMsg("Failed to save student data. Make sure Firestore rules are open.");
    } finally {
      setLoading(false);
    }
  };

  // --- 4. Main UI Render ---
  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Manage Students</h1>
        <p className="text-sm text-slate-500 mt-1">Add new students or update existing records.</p>
      </div>

      {/* Main Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form (Takes 2/3 space) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative">
          
          {/* Alerts */}
          {success && (
            <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-100 animate-fade-in-down">
              <CheckCircle2 size={20} className="text-green-500" />
              <span className="font-medium text-sm">Student saved successfully!</span>
            </div>
          )}
          {errorMsg && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100 animate-fade-in-down">
              <AlertCircle size={20} className="text-red-500" />
              <span className="font-medium text-sm">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveStudent} className="space-y-8">
            
            {/* --- BASIC IDENTITY SECTION --- */}
            <section>
              <h3 className="text-[11px] font-bold text-[#3ac47d] uppercase tracking-widest mb-4">Basic Identity</h3>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                
                {/* Image Upload Area */}
                <div className="relative group shrink-0">
                  <div className="w-28 h-28 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-[#3ac47d] group-hover:bg-[#3ac47d]/5 cursor-pointer">
                    {photoBase64 ? (
                      <img src={photoBase64} alt="Student" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon size={24} className="text-slate-400 group-hover:text-[#3ac47d] mb-1" />
                        <span className="text-[10px] text-slate-400 font-medium group-hover:text-[#3ac47d]">Upload Photo</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                    />
                  </div>
                </div>

                {/* Identity Fields */}
                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required name="name" value={formData.name} onChange={handleInputChange} type="text" placeholder="Full Name" className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50 border border-slate-100 font-medium" />
                  <input required name="idNumber" value={formData.idNumber} onChange={handleInputChange} type="text" placeholder="B-Form / ID Number" className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50 border border-slate-100 font-medium" />
                  <input required name="dob" value={formData.dob} onChange={handleInputChange} type="date" className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50 border border-slate-100 font-medium text-slate-500" />
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50 border border-slate-100 font-medium text-slate-700">
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </div>
            </section>

            {/* --- FAMILY & CONTACT SECTION --- */}
            <section>
              <h3 className="text-[11px] font-bold text-[#3ac47d] uppercase tracking-widest mb-4">Family & Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required name="fatherName" value={formData.fatherName} onChange={handleInputChange} type="text" placeholder="Father's Name" className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50 border border-slate-100 font-medium" />
                <input required name="fatherProfession" value={formData.fatherProfession} onChange={handleInputChange} type="text" placeholder="Father's Profession" className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50 border border-slate-100 font-medium" />
                <input required name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="Phone Number" className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50 border border-slate-100 font-medium" />
                <input required name="address" value={formData.address} onChange={handleInputChange} type="text" placeholder="Home Address" className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50 border border-slate-100 font-medium" />
              </div>
            </section>

            {/* --- SCHOOL PLACEMENT SECTION --- */}
            <section>
              <h3 className="text-[11px] font-bold text-[#3ac47d] uppercase tracking-widest mb-4">School Placement</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input required name="admissionDate" value={formData.admissionDate} onChange={handleInputChange} type="date" className="w-full bg-[#f0fdf4] outline-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#3ac47d]/50 border border-green-100 font-medium text-green-700" />
                <input required name="rollNumber" value={formData.rollNumber} onChange={handleInputChange} type="number" placeholder="Roll No." className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50 border border-slate-100 font-medium" />
                <input required name="classGrade" value={formData.classGrade} onChange={handleInputChange} type="text" placeholder="Class / Grade" className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50 border border-slate-100 font-medium" />
              </div>
            </section>

            {/* Save Button */}
            <div className="pt-4 flex justify-end">
              <button 
                disabled={loading}
                type="submit" 
                className="bg-[#3ac47d] hover:bg-[#2eaa6a] text-white px-8 py-3.5 rounded-xl font-bold shadow-md shadow-[#3ac47d]/20 transition-all disabled:opacity-70 flex items-center gap-2 active:scale-95"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <UploadCloud size={18} />
                    Save Student
                  </>
                )}
              </button>
            </div>
          </form>

        </div>

        {/* Right Column: Directory Placeholder (Takes 1/3 space) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full min-h-[400px]">
             <h2 className="text-lg font-bold text-slate-800 mb-4">Directory (Recent)</h2>
             
             <div className="bg-slate-50 rounded-xl px-4 py-3 mb-6 flex items-center gap-3 border border-slate-100">
               <span className="text-slate-400">🔍</span>
               <input type="text" placeholder="Search saved students..." className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400" />
             </div>

             <div className="flex flex-col items-center justify-center h-48 text-center opacity-60">
               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-2xl">📂</span>
               </div>
               <p className="text-sm font-medium text-slate-500">No recent students found.<br/>Save a student to see them here.</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
