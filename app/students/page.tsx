"use client";
import React, { useState, useEffect, useRef } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "@/lib/firebase";
import { Camera, Search, Pencil, Trash2, User } from "lucide-react";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Image Upload States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: "", cnic: "", dob: "", gender: "Male", religion: "",
    fatherName: "", motherName: "", phone: "", occupation: "",
    admNo: "", rollNo: "", studentClass: "", section: "", photoUrl: ""
  });

  // Fetch Students in Real-time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "students"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(data);
    });
    return () => unsub();
  }, []);

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. Handle Image Selection
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Show preview instantly
    }
  };

  // 2. Save or Update Student
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalPhotoUrl = formData.photoUrl;

      // Upload image to Firebase Storage if a new one is selected
      if (imageFile) {
        const storage = getStorage();
        const storageRef = ref(storage, `students/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        finalPhotoUrl = await getDownloadURL(storageRef);
      }

      const finalData = { ...formData, photoUrl: finalPhotoUrl };

      if (editingId) {
        // Update existing record
        await updateDoc(doc(db, "students", editingId), finalData);
        alert("Student updated successfully!");
      } else {
        // Create new record
        await addDoc(collection(db, "students"), finalData);
        alert("Student added successfully!");
      }

      // Reset Form
      setFormData({
        fullName: "", cnic: "", dob: "", gender: "Male", religion: "",
        fatherName: "", motherName: "", phone: "", occupation: "",
        admNo: "", rollNo: "", studentClass: "", section: "", photoUrl: ""
      });
      setImageFile(null);
      setImagePreview(null);
      setEditingId(null);
    } catch (error) {
      console.error("Error saving student: ", error);
      alert("Error saving data. Please check connection.");
    }
    setLoading(false);
  };

  // 3. Edit Student
  const handleEdit = (student: any) => {
    setFormData(student);
    setEditingId(student.id);
    setImagePreview(student.photoUrl || null);
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to form
  };

  // 4. Delete Student
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this student record? This cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "students", id));
      } catch (error) {
        console.error("Error deleting: ", error);
      }
    }
  };

  const filteredStudents = students.filter(s => 
    s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.admNo?.includes(searchTerm)
  );

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#0F172A]">Full Student Enrollment</h1>
        <p className="text-gray-500 mt-1 font-medium">Add new students or update existing records.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT PANEL: Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Section 1: Basic Identity */}
            <div>
              <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest mb-5">Basic Identity</p>
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* Clickable Image Upload Box */}
                <div 
                  onClick={handleImageClick}
                  className="w-32 h-32 bg-[#1E1B4B] rounded-3xl flex flex-col items-center justify-center text-white shrink-0 cursor-pointer hover:bg-[#2d2966] transition-all overflow-hidden relative shadow-md group"
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                  />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Camera size={28} className="mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold tracking-wide">PHOTO</span>
                    </>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-bold">Change</span>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required name="fullName" value={formData.fullName} onChange={handleInputChange} type="text" placeholder="Full Name *" className="bg-gray-50 border border-transparent focus:border-indigo-500 outline-none rounded-xl px-4 py-3 text-sm font-medium" />
                  <input name="cnic" value={formData.cnic} onChange={handleInputChange} type="text" placeholder="CNIC / B-Form *" className="bg-gray-50 border border-transparent focus:border-indigo-500 outline-none rounded-xl px-4 py-3 text-sm font-medium" />
                  <input required name="dob" value={formData.dob} onChange={handleInputChange} type="date" className="bg-gray-50 border border-transparent focus:border-indigo-500 outline-none rounded-xl px-4 py-3 text-sm font-medium text-gray-500" />
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="bg-gray-50 border border-transparent focus:border-indigo-500 outline-none rounded-xl px-4 py-3 text-sm font-medium text-gray-700">
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                  {/* Changed Religion to Text Input */}
                  <input name="religion" value={formData.religion} onChange={handleInputChange} type="text" placeholder="Religion (e.g. Islam, Christianity)" className="bg-gray-50 border border-transparent focus:border-indigo-500 outline-none rounded-xl px-4 py-3 text-sm font-medium md:col-span-2" />
                </div>
              </div>
            </div>

            {/* Section 2: Family & Contact */}
            <div>
              <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest mb-5">Family & Contact</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required name="fatherName" value={formData.fatherName} onChange={handleInputChange} type="text" placeholder="Father's Name *" className="bg-gray-50 border border-transparent focus:border-indigo-500 outline-none rounded-xl px-4 py-3 text-sm font-medium" />
                <input name="motherName" value={formData.motherName} onChange={handleInputChange} type="text" placeholder="Mother's Name" className="bg-gray-50 border border-transparent focus:border-indigo-500 outline-none rounded-xl px-4 py-3 text-sm font-medium" />
                <input required name="phone" value={formData.phone} onChange={handleInputChange} type="text" placeholder="Guardian Phone *" className="bg-gray-50 border border-transparent focus:border-indigo-500 outline-none rounded-xl px-4 py-3 text-sm font-medium" />
                <input name="occupation" value={formData.occupation} onChange={handleInputChange} type="text" placeholder="Father's Occupation" className="bg-gray-50 border border-transparent focus:border-indigo-500 outline-none rounded-xl px-4 py-3 text-sm font-medium" />
              </div>
            </div>

            {/* Section 3: School Placement */}
            <div>
              <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest mb-5">School Placement</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input required name="admNo" value={formData.admNo} onChange={handleInputChange} type="text" placeholder="Adm No *" className="bg-[#1E1B4B] text-white placeholder-indigo-200 border border-transparent outline-none rounded-xl px-4 py-3 text-sm font-medium" />
                <input name="rollNo" value={formData.rollNo} onChange={handleInputChange} type="text" placeholder="Roll No" className="bg-gray-50 border border-transparent focus:border-indigo-500 outline-none rounded-xl px-4 py-3 text-sm font-medium" />
                <input required name="studentClass" value={formData.studentClass} onChange={handleInputChange} type="text" placeholder="Class *" className="bg-gray-50 border border-transparent focus:border-indigo-500 outline-none rounded-xl px-4 py-3 text-sm font-medium" />
                <input name="section" value={formData.section} onChange={handleInputChange} type="text" placeholder="Section Name" className="bg-gray-50 border border-transparent focus:border-indigo-500 outline-none rounded-xl px-4 py-3 text-sm font-medium md:col-span-3" />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              {editingId && (
                <button type="button" onClick={() => {setEditingId(null); setFormData({fullName: "", cnic: "", dob: "", gender: "Male", religion: "", fatherName: "", motherName: "", phone: "", occupation: "", admNo: "", rollNo: "", studentClass: "", section: "", photoUrl: ""}); setImagePreview(null);}} className="px-6 py-3 rounded-xl text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all">Cancel Edit</button>
              )}
              <button disabled={loading} type="submit" className="bg-[#3ac47d] hover:bg-[#2eaa6a] text-white px-8 py-3 rounded-xl text-sm font-bold shadow-md shadow-green-500/20 transition-all">
                {loading ? "Saving..." : (editingId ? "Update Student" : "Enroll Student")}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT PANEL: Directory */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-[800px]">
          <h2 className="text-xl font-bold text-[#0F172A] mb-4">Directory ({filteredStudents.length})</h2>
          
          <div className="relative mb-6">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search admission no or name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-transparent focus:border-indigo-500 outline-none rounded-full pl-10 pr-4 py-2.5 text-sm font-medium"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
            {filteredStudents.length === 0 ? (
              <p className="text-center text-gray-400 text-sm mt-10">No students found.</p>
            ) : (
              filteredStudents.map((student) => (
                <div key={student.id} className="group bg-white border border-gray-100 hover:border-indigo-100 p-4 rounded-2xl flex items-center gap-4 transition-all hover:shadow-sm relative">
                  
                  {student.photoUrl ? (
                    <img src={student.photoUrl} alt={student.fullName} className="w-12 h-12 rounded-full object-cover border-2 border-indigo-50" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#1E1B4B] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {student.admNo || <User size={16} />}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[#0F172A] truncate text-sm">{student.fullName}</h4>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider truncate">Class {student.studentClass} {student.section && `- ${student.section}`} | {student.phone}</p>
                  </div>

                  {/* Actions (Edit & Delete) - Show on Hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 absolute right-4 bg-white/90 pl-2">
                    <button onClick={() => handleEdit(student)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1.5 rounded-md transition-colors" title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(student.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-md transition-colors" title="Delete">
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
  );
}
