// app/(protected)/students/add/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, UserPlus, Upload, Camera } from "lucide-react";

export default function AddStudentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ⬇️ یہ وہ تمام فیلڈز ہیں جو پرانے سسٹم میں شامل تھیں
  const [form, setForm] = useState({
    fullName: "",
    fatherName: "",
    cnic: "",
    dob: "",
    gender: "Male",
    bloodGroup: "",
    religion: "",
    nationality: "",
    phone: "",
    email: "",
    address: "",
    classGrade: "",
    section: "",
    rollNumber: "",
    admissionNumber: "",
    guardianName: "",
    guardianRelation: "",
    guardianPhone: "",
    previousSchool: "",
    medicalConditions: "",
    photoBase64: "",
  });

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => handleChange("photoBase64", reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.classGrade) {
      setError("Name and Class are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tenantId: user?.tenantId,
          createdBy: user?.uid,
        }),
      });
      if (res.ok) {
        setSuccess("Student admitted successfully!");
        setTimeout(() => router.push("/students"), 1500);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to admit student.");
      }
    } catch (err) {
      setError("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
        <UserPlus className="text-blue-600" /> Admit New Student
      </h1>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl font-bold">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 p-3 rounded-xl font-bold">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
        {/* Photo Upload */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {form.photoBase64 ? (
              <img src={form.photoBase64} alt="Student" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <Camera size={32} className="text-gray-400" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer">
              <Upload size={14} />
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
          <div>
            <p className="text-sm text-gray-500">Upload student photo (optional)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Full Name *" value={form.fullName} onChange={e => handleChange("fullName", e.target.value)} required />
          <Input label="Father Name" value={form.fatherName} onChange={e => handleChange("fatherName", e.target.value)} />
          <Input label="CNIC / B-Form" value={form.cnic} onChange={e => handleChange("cnic", e.target.value)} />
          <Input label="Date of Birth" type="date" value={form.dob} onChange={e => handleChange("dob", e.target.value)} />
          <Select label="Gender" value={form.gender} onChange={e => handleChange("gender", e.target.value)} options={["Male", "Female", "Other"]} />
          <Input label="Blood Group" value={form.bloodGroup} onChange={e => handleChange("bloodGroup", e.target.value)} />
          <Input label="Religion" value={form.religion} onChange={e => handleChange("religion", e.target.value)} />
          <Input label="Nationality" value={form.nationality} onChange={e => handleChange("nationality", e.target.value)} />
          <Input label="Phone" value={form.phone} onChange={e => handleChange("phone", e.target.value)} />
          <Input label="Email" value={form.email} onChange={e => handleChange("email", e.target.value)} />
          <Input label="Address" value={form.address} onChange={e => handleChange("address", e.target.value)} />
          <Input label="Class / Grade *" value={form.classGrade} onChange={e => handleChange("classGrade", e.target.value)} required />
          <Input label="Section" value={form.section} onChange={e => handleChange("section", e.target.value)} />
          <Input label="Roll Number" value={form.rollNumber} onChange={e => handleChange("rollNumber", e.target.value)} />
          <Input label="Admission Number" value={form.admissionNumber} onChange={e => handleChange("admissionNumber", e.target.value)} />
          <Input label="Guardian Name" value={form.guardianName} onChange={e => handleChange("guardianName", e.target.value)} />
          <Input label="Guardian Relation" value={form.guardianRelation} onChange={e => handleChange("guardianRelation", e.target.value)} />
          <Input label="Guardian Phone" value={form.guardianPhone} onChange={e => handleChange("guardianPhone", e.target.value)} />
          <Input label="Previous School" value={form.previousSchool} onChange={e => handleChange("previousSchool", e.target.value)} />
          <Input label="Medical Conditions" value={form.medicalConditions} onChange={e => handleChange("medicalConditions", e.target.value)} />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          {submitting ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
          {submitting ? "Admitting..." : "Confirm Admission"}
        </button>
      </form>
    </div>
  );
}

// Reusable Input & Select components (اگر آپ کے پاس نہ ہوں تو یہ شامل کریں)
function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-sm font-bold text-gray-700 mb-1 block">{label}</label>
      <input {...props} className="w-full border border-gray-300 rounded-xl p-2 text-gray-900" />
    </div>
  );
}

function Select({ label, options, ...props }: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="text-sm font-bold text-gray-700 mb-1 block">{label}</label>
      <select {...props} className="w-full border border-gray-300 rounded-xl p-2 text-gray-900">
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}
