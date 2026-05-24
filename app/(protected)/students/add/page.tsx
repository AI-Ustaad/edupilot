"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Upload, Save, X, CheckCircle2, AlertCircle } from "lucide-react";

export default function AddStudentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const [classes, setClasses] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    fullName: "",
    fatherName: "",
    cnic: "",
    dob: "",
    gender: "Male",
    religion: "Islam",
    phone: "",
    email: "",
    address: "",
    classGrade: "",
    section: "",
    rollNumber: "",
    studentIdNumber: "",
    medicalHistory: "",
    photoBase64: "",
  });

  // Fetch classes and sections
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        setClasses(data.classes || []);
        setSections((data.sections || []).map((s: any) => s.sectionName));
      } catch (err) {
        console.error("Failed to load settings");
      }
    };
    fetchSettings();
  }, []);

  // Load OCR data from sessionStorage if coming from OCR upload
  useEffect(() => {
    const isOcrFlow = searchParams.get("ocr") === "true";
    if (isOcrFlow) {
      const ocrData = sessionStorage.getItem("ocrStudentData");
      if (ocrData) {
        try {
          const data = JSON.parse(ocrData);
          setFormData(prev => ({
            ...prev,
            fullName: data.fullName || prev.fullName,
            fatherName: data.fatherName || prev.fatherName,
            cnic: data.cnic || prev.cnic,
            dob: data.dob || prev.dob,
            phone: data.phone || prev.phone,
            email: data.email || prev.email,
            address: data.address || prev.address,
            classGrade: data.classGrade || prev.classGrade,
            rollNumber: data.rollNumber || prev.rollNumber,
            gender: data.gender || prev.gender,
            religion: data.religion || prev.religion,
            photoBase64: data.photoBase64 || prev.photoBase64,
          }));
          sessionStorage.removeItem("ocrStudentData");
        } catch (err) {
          console.error("Failed to parse OCR data");
        }
      }
    }
  }, [searchParams]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData({ ...formData, photoBase64: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleOCRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setOcrLoading(true);
    setError("");
    
    const fd = new FormData();
    fd.append("file", file);
    
    try {
      const res = await fetch("/api/students/ocr-admission", {
        method: "POST",
        body: fd,
      });
      const result = await res.json();
      
      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          fullName: result.data.fullName || prev.fullName,
          fatherName: result.data.fatherName || prev.fatherName,
          cnic: result.data.cnic || prev.cnic,
          dob: result.data.dob || prev.dob,
          phone: result.data.phone || prev.phone,
          email: result.data.email || prev.email,
          address: result.data.address || prev.address,
          classGrade: result.data.classGrade || prev.classGrade,
          rollNumber: result.data.rollNumber || prev.rollNumber,
          gender: result.data.gender || prev.gender,
          religion: result.data.religion || prev.religion,
          photoBase64: result.data.photoBase64 || prev.photoBase64,
        }));
        alert("Document processed! Form fields have been auto-filled.");
      } else {
        setError(result.error || "Failed to extract data");
      }
    } catch (err) {
      setError("OCR processing failed. Please try again.");
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.classGrade || !formData.rollNumber) {
      setError("Full Name, Class, and Roll Number are required.");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, rollNumber: Number(formData.rollNumber) }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add student");
      }
      setSuccess(true);
      setTimeout(() => router.push("/students"), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black">Add New Student</h1>
        <button onClick={() => router.push("/students")} className="text-slate-500 hover:text-slate-700">
          <X size={24} />
        </button>
      </div>

      {/* OCR Upload Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-6 mb-8 border border-blue-100 dark:border-blue-800">
        <div className="flex items-center gap-3 mb-3">
          <Upload size={24} className="text-blue-600" />
          <h2 className="text-xl font-bold">Quick Import via Document</h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Upload admission form (Image, PDF, or Word document) – We'll auto-fill the form fields!
        </p>
        <div className="flex items-center gap-4 flex-wrap">
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition">
            {ocrLoading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
            {ocrLoading ? "Processing..." : "Upload Document"}
            <input type="file" accept="image/*,application/pdf,.docx" onChange={handleOCRUpload} className="hidden" />
          </label>
          {ocrLoading && <span className="text-sm text-slate-500">Extracting data... This may take a few seconds.</span>}
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}
      </div>

      {/* Student Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border p-6 space-y-4">
        {success && (
          <div className="bg-green-50 text-green-700 p-3 rounded-xl flex items-center gap-2">
            <CheckCircle2 size={18} /> Student added successfully! Redirecting...
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="fullName" placeholder="Full Name *" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="border rounded-xl p-3 bg-slate-50 dark:bg-slate-700" required />
          <input name="fatherName" placeholder="Father's Name" value={formData.fatherName} onChange={e => setFormData({ ...formData, fatherName: e.target.value })} className="border rounded-xl p-3 bg-slate-50 dark:bg-slate-700" />
          <input name="cnic" placeholder="CNIC / B-Form" value={formData.cnic} onChange={e => setFormData({ ...formData, cnic: e.target.value })} className="border rounded-xl p-3 bg-slate-50 dark:bg-slate-700" />
          <input name="dob" type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} className="border rounded-xl p-3 bg-slate-50 dark:bg-slate-700" />
          
          <select name="gender" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="border rounded-xl p-3 bg-slate-50 dark:bg-slate-700">
            <option>Male</option><option>Female</option><option>Other</option>
          </select>
          <input name="religion" placeholder="Religion" value={formData.religion} onChange={e => setFormData({ ...formData, religion: e.target.value })} className="border rounded-xl p-3 bg-slate-50 dark:bg-slate-700" />
          <input name="phone" placeholder="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="border rounded-xl p-3 bg-slate-50 dark:bg-slate-700" />
          <input name="email" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="border rounded-xl p-3 bg-slate-50 dark:bg-slate-700" />
          
          <textarea name="address" placeholder="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} rows={2} className="col-span-2 border rounded-xl p-3 bg-slate-50 dark:bg-slate-700" />
          
          <select name="classGrade" value={formData.classGrade} onChange={e => setFormData({ ...formData, classGrade: e.target.value })} required className="border rounded-xl p-3 bg-slate-50 dark:bg-slate-700">
            <option value="">Select Class</option>
            {classes.map(c => <option key={c}>{c}</option>)}
          </select>
          <select name="section" value={formData.section} onChange={e => setFormData({ ...formData, section: e.target.value })} className="border rounded-xl p-3 bg-slate-50 dark:bg-slate-700">
            <option value="">Select Section</option>
            {sections.map(s => <option key={s}>{s}</option>)}
          </select>
          
          <input name="rollNumber" type="number" placeholder="Roll Number *" value={formData.rollNumber} onChange={e => setFormData({ ...formData, rollNumber: e.target.value })} required className="border rounded-xl p-3 bg-slate-50 dark:bg-slate-700" />
          <input name="studentIdNumber" placeholder="Student ID (optional)" value={formData.studentIdNumber} onChange={e => setFormData({ ...formData, studentIdNumber: e.target.value })} className="border rounded-xl p-3 bg-slate-50 dark:bg-slate-700" />
          
          <textarea name="medicalHistory" placeholder="Medical History (allergies, conditions)" value={formData.medicalHistory} onChange={e => setFormData({ ...formData, medicalHistory: e.target.value })} rows={2} className="col-span-2 border rounded-xl p-3 bg-slate-50 dark:bg-slate-700" />
          
          <div className="col-span-2">
            <label className="block text-sm font-bold mb-1">Student Photo</label>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="border rounded-xl p-2 w-full" />
            {formData.photoBase64 && <img src={formData.photoBase64} className="mt-2 w-24 h-24 object-cover rounded-lg" />}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => router.push("/students")} className="px-6 py-2 border rounded-xl">Cancel</button>
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-xl flex items-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />} Save Student
          </button>
        </div>
      </form>
    </div>
  );
}
