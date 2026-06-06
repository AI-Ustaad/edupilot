"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSchool } from "@/hooks/useSchool";
import { Loader2, Save, User, Users, BookOpen, HeartPulse, CheckCircle } from "lucide-react";

export default function AddStudentPage() {
  const router = useRouter();
  // Using your custom hook for classes and sections
  const { classes, sections, selectedClass, setSelectedClass, selectedSection, setSelectedSection, loadingSettings } = useSchool();
  
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    fullName: "", fatherName: "", dob: "", gender: "Male", cnic: "", photoBase64: "",
    phone: "", address: "", religion: "", nationality: "Pakistani",
    rollNumber: "", admissionNumber: "", previousSchool: "",
    guardianName: "", guardianPhone: "", guardianRelation: "",
    bloodGroup: "", medicalConditions: ""
  });

  // 🚀 Restore OCR Data if it was passed via sessionStorage
  useEffect(() => {
    const ocrData = sessionStorage.getItem("ocrStudentData");
    if (ocrData) {
      try {
        const parsed = JSON.parse(ocrData);
        setForm(prev => ({ ...prev, ...parsed }));
        sessionStorage.removeItem("ocrStudentData"); // Clean up
      } catch (e) {
        console.error("Failed to parse OCR data");
      }
    }
  }, []);

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm({ ...form, photoBase64: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedSection) return alert("Please select Class and Section.");
    
    setLoading(true);
    try {
      // 🚀 Pointing strictly to /api/v1/students
      const res = await fetch("/api/v1/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, classGrade: selectedClass, section: selectedSection, rollNumber: Number(form.rollNumber) })
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          router.push("/students");
        }, 2000);
      } else {
        alert("Failed to add student.");
      }
    } catch (error) {
      alert("Network Error!");
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({ id, icon: Icon, label }: any) => (
    <button type="button" onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
      <Icon size={18} /> {label}
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Add New Student Profile</h1>

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 font-bold border border-green-200">
          <CheckCircle size={20} /> Student successfully enrolled!
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Tabs Header */}
        <div className="flex border-b border-gray-100 bg-gray-50 px-2 overflow-x-auto">
          <TabButton id="personal" icon={User} label="Personal Details" />
          <TabButton id="academic" icon={BookOpen} label="Academic Info" />
          <TabButton id="parents" icon={Users} label="Parents/Guardian" />
          <TabButton id="medical" icon={HeartPulse} label="Medical & Health" />
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "personal" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">
              <div><label className="text-xs font-bold text-gray-500">Full Name *</label><input required name="fullName" value={form.fullName} onChange={handleChange} className="w-full border p-3 rounded-xl mt-1" /></div>
              <div><label className="text-xs font-bold text-gray-500">Father's Name *</label><input required name="fatherName" value={form.fatherName} onChange={handleChange} className="w-full border p-3 rounded-xl mt-1" /></div>
              <div><label className="text-xs font-bold text-gray-500">CNIC / B-Form</label><input name="cnic" value={form.cnic} onChange={handleChange} className="w-full border p-3 rounded-xl mt-1" /></div>
              <div><label className="text-xs font-bold text-gray-500">Date of Birth</label><input type="date" name="dob" value={form.dob} onChange={handleChange} className="w-full border p-3 rounded-xl mt-1" /></div>
              <div><label className="text-xs font-bold text-gray-500">Gender</label><select name="gender" value={form.gender} onChange={handleChange} className="w-full border p-3 rounded-xl mt-1"><option>Male</option><option>Female</option></select></div>
              <div><label className="text-xs font-bold text-gray-500">Religion</label><input name="religion" value={form.religion} onChange={handleChange} className="w-full border p-3 rounded-xl mt-1" /></div>
              <div><label className="text-xs font-bold text-gray-500">Contact Phone</label><input name="phone" value={form.phone} onChange={handleChange} className="w-full border p-3 rounded-xl mt-1" /></div>
              <div><label className="text-xs font-bold text-gray-500">Nationality</label><input name="nationality" value={form.nationality} onChange={handleChange} className="w-full border p-3 rounded-xl mt-1" /></div>
              <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500">Home Address</label><input name="address" value={form.address} onChange={handleChange} className="w-full border p-3 rounded-xl mt-1" /></div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-500">Profile Photo</label>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="w-full border p-3 rounded-xl mt-1" />
                {form.photoBase64 && <img src={form.photoBase64} alt="Preview" className="mt-3 w-20 h-20 object-cover rounded-xl border" />}
              </div>
            </div>
          )}

          {activeTab === "academic" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">
              <div>
                <label className="text-xs font-bold text-gray-500">Class *</label>
                <select required value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full border p-3 rounded-xl mt-1 bg-gray-50">
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">Section *</label>
                <select required disabled={!selectedClass} value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} className="w-full border p-3 rounded-xl mt-1 bg-gray-50 disabled:opacity-50">
                  <option value="">Select Section</option>
                  {/* 🚀 TypeScript Bug Fixed Here */}
                  {sections.map((s: any, index: number) => {
                    const sectionName = typeof s === 'string' ? s : s.sectionName;
                    return (
                      <option key={sectionName || index} value={sectionName}>
                        {sectionName}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div><label className="text-xs font-bold text-gray-500">Roll Number *</label><input required type="number" name="rollNumber" value={form.rollNumber} onChange={handleChange} className="w-full border p-3 rounded-xl mt-1" /></div>
              <div><label className="text-xs font-bold text-gray-500">Admission Number</label><input name="admissionNumber" value={form.admissionNumber} onChange={handleChange} className="w-full border p-3 rounded-xl mt-1" /></div>
              <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500">Previous School Attended</label><input name="previousSchool" value={form.previousSchool} onChange={handleChange} className="w-full border p-3 rounded-xl mt-1" /></div>
            </div>
          )}

          {activeTab === "parents" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">
              <div><label className="text-xs font-bold text-gray-500">Guardian Name *</label><input required name="guardianName" value={form.guardianName} onChange={handleChange} className="w-full border p-3 rounded-xl mt-1" /></div>
              <div><label className="text-xs font-bold text-gray-500">Guardian Relation</label><input placeholder="e.g. Father, Uncle" name="guardianRelation" value={form.guardianRelation} onChange={handleChange} className="w-full border p-3 rounded-xl mt-1" /></div>
              <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500">Guardian Emergency Phone *</label><input required name="guardianPhone" value={form.guardianPhone} onChange={handleChange} className="w-full border p-3 rounded-xl mt-1" /></div>
            </div>
          )}

          {activeTab === "medical" && (
            <div className="grid grid-cols-1 gap-4 animate-fade-in-up">
              <div>
                <label className="text-xs font-bold text-gray-500">Blood Group</label>
                <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className="w-full border p-3 rounded-xl mt-1 md:w-1/2">
                  <option value="">Select</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                </select>
              </div>
              <div><label className="text-xs font-bold text-gray-500">Allergies / Medical Conditions</label><textarea rows={3} placeholder="Any known allergies or medical history..." name="medicalConditions" value={form.medicalConditions} onChange={handleChange} className="w-full border p-3 rounded-xl mt-1" /></div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Enroll Student
          </button>
        </div>
      </form>
    </div>
  );
}
