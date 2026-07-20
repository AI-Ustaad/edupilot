"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, UserPlus, Upload, Camera } from "lucide-react";
import Image from "next/image";

// 🚀 Layered Architecture Hooks
import { useStudentMutations } from "@/hooks/api/useStudentMutations";
import { useConfiguration } from "@/app/(protected)/providers/ConfigurationProvider";

export default function AddStudentPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [error, setError] = useState("");

  // 🟢 The Enterprise Mutation Engine
  const { createStudent, isCreating } = useStudentMutations();
  
  // 🟢 Fetch School Configuration for Dynamic Classes & Sections
  const { config, isLoading: configLoading } = useConfiguration();

  const [form, setForm] = useState({
    fullName: "", fatherName: "", cnic: "", dob: "",
    gender: "Male", bloodGroup: "", religion: "", nationality: "",
    phone: "", email: "", address: "",
    classGrade: "", section: "", rollNumber: "", admissionNumber: "",
    guardianName: "", guardianRelation: "", guardianPhone: "",
    previousSchool: "", medicalConditions: "", photoBase64: "",
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
    setError("");

    try {
      const nameParts = form.fullName.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ");

      await createStudent({
        identity: {
          admissionNumber: form.admissionNumber || `ADM-${Date.now().toString().slice(-6)}`,
          rollNumber: form.rollNumber,
          cnicOrBForm: form.cnic,
        },
        personal: {
          firstName: firstName,
          lastName: lastName || "",
          dateOfBirth: form.dob || new Date().toISOString(),
          gender: form.gender as "Male" | "Female" | "Other",
          avatarUrl: form.photoBase64,
        },
        academic: {
          campusId: user?.tenantId || "default-campus",
          classId: form.classGrade,
          sectionId: form.section,
          admissionDate: new Date().toISOString(),
        },
        parentReferences: {
          primaryParentId: `parent-${Date.now()}`,
          emergencyContactPhone: form.guardianPhone || form.phone,
        },
        status: "Active",
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
          //@ts-ignore
          extendedData: {
            bloodGroup: form.bloodGroup,
            religion: form.religion,
            nationality: form.nationality,
            previousSchool: form.previousSchool,
            medicalConditions: form.medicalConditions,
            fatherName: form.fatherName,
            address: form.address,
            email: form.email,
            guardianName: form.guardianName,
            guardianRelation: form.guardianRelation
          }
        }
      });

      router.push("/students");

    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to admit student to the Enterprise Domain.");
    }
  };

  if (configLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
        <UserPlus className="text-blue-600" /> Admit New Student
      </h1>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl font-bold border border-red-200">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6 shadow-sm">
        {/* Photo Upload */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {form.photoBase64 ? (
              <Image 
                src={form.photoBase64} 
                alt="Student Photo" 
                width={96} 
                height={96} 
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-50" 
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center border-4 border-gray-100">
                <Camera size={32} className="text-gray-300" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-lg transition">
              <Upload size={14} />
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Student Identity Photo</h3>
            <p className="text-sm text-gray-500">Upload a clear, front-facing photograph</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Full Name *" value={form.fullName} onChange={e => handleChange("fullName", e.target.value)} required placeholder="Ali Khan" />
          <Input label="Father Name" value={form.fatherName} onChange={e => handleChange("fatherName", e.target.value)} placeholder="Tariq Khan" />
          <Input label="CNIC / B-Form" value={form.cnic} onChange={e => handleChange("cnic", e.target.value)} placeholder="xxxxx-xxxxxxx-x" />
          <Input label="Date of Birth" type="date" value={form.dob} onChange={e => handleChange("dob", e.target.value)} />
          <Select label="Gender" value={form.gender} onChange={e => handleChange("gender", e.target.value)} options={["Male", "Female", "Other"]} />
          <Input label="Blood Group" value={form.bloodGroup} onChange={e => handleChange("bloodGroup", e.target.value)} placeholder="O+" />
          <Input label="Religion" value={form.religion} onChange={e => handleChange("religion", e.target.value)} placeholder="Islam" />
          <Input label="Nationality" value={form.nationality} onChange={e => handleChange("nationality", e.target.value)} placeholder="Pakistani" />
          <Input label="Phone" value={form.phone} onChange={e => handleChange("phone", e.target.value)} placeholder="0300-0000000" />
          <Input label="Email" value={form.email} onChange={e => handleChange("email", e.target.value)} placeholder="student@example.com" />
          <Input label="Address" value={form.address} onChange={e => handleChange("address", e.target.value)} placeholder="123 Main Street" />
          
          {/* 🚀 DYNAMIC CLASSES DROPDOWN (Final Fix: config.classes) */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">Class / Grade *</label>
            <select 
              value={form.classGrade} 
              onChange={e => handleChange("classGrade", e.target.value)} 
              required
              className="w-full border border-gray-200 bg-gray-50 rounded-xl p-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
            >
              <option value="">-- Select Class --</option>
              {config?.classes?.map((cls: any) => (
                <option key={cls.id} value={cls.name}>{cls.name}</option>
              ))}
            </select>
          </div>
          
          {/* 🚀 DYNAMIC SECTIONS DROPDOWN (Final Fix: config.sectionNames) */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">Section</label>
            <select 
              value={form.section} 
              onChange={e => handleChange("section", e.target.value)} 
              className="w-full border border-gray-200 bg-gray-50 rounded-xl p-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
            >
              <option value="">-- Select Section --</option>
              {config?.sectionNames?.map((sec: string) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>
          
          <Input label="Roll Number" value={form.rollNumber} onChange={e => handleChange("rollNumber", e.target.value)} placeholder="101" />
          <Input label="Admission Number" value={form.admissionNumber} onChange={e => handleChange("admissionNumber", e.target.value)} placeholder="Leave blank to auto-generate" />
          <Input label="Guardian Name" value={form.guardianName} onChange={e => handleChange("guardianName", e.target.value)} />
          <Input label="Guardian Relation" value={form.guardianRelation} onChange={e => handleChange("guardianRelation", e.target.value)} placeholder="Uncle, Brother, etc." />
          <Input label="Guardian Phone" value={form.guardianPhone} onChange={e => handleChange("guardianPhone", e.target.value)} />
          <Input label="Previous School" value={form.previousSchool} onChange={e => handleChange("previousSchool", e.target.value)} />
          <Input label="Medical Conditions" value={form.medicalConditions} onChange={e => handleChange("medicalConditions", e.target.value)} placeholder="Allergies, etc." />
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={isCreating}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isCreating ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
            {isCreating ? "Synchronizing to Domain..." : "Confirm Admission"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-sm font-bold text-gray-700 mb-1.5 block">{label}</label>
      <input {...props} className="w-full border border-gray-200 bg-gray-50 rounded-xl p-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition" />
    </div>
  );
}

function Select({ label, options, ...props }: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="text-sm font-bold text-gray-700 mb-1.5 block">{label}</label>
      <select {...props} className="w-full border border-gray-200 bg-gray-50 rounded-xl p-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition">
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}
