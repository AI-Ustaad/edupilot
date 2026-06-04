"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Save, UserPlus, Camera } from "lucide-react";

export default function AddStudentPage() {
  const { user } = useAuth();
  const router = useRouter();

  // 🔥 proper typing and loading
  const [classes, setClasses] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [allClassesData, setAllClassesData] = useState<any[]>([]);  // full objects for section extraction
  const [loadingSettings, setLoadingSettings] = useState(true);

  const [form, setForm] = useState({
    fullName: "",
    fatherName: "",
    classGrade: "",
    section: "",
    rollNumber: "",
    gender: "Male",
    dateOfBirth: "",
    phone: "",
    address: "",
    photoBase64: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 1. Fetch settings (classes, sections, subjects)
  useEffect(() => {
    if (!user?.tenantId) return;
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        const rawClasses = data.classes || data.data?.classes || [];
        const rawSubjects = data.subjects || data.data?.subjects || [];

        // Extract class names whether they are strings or objects
        const classNames = rawClasses.map((c: any) =>
          typeof c === "string" ? c : c.name || c.classGrade || c
        );
        setClasses(classNames);
        setAllClassesData(rawClasses);  // keep full objects for sections
        setSubjects(Array.isArray(rawSubjects) ? rawSubjects : []);
        setLoadingSettings(false);
      })
      .catch(() => setLoadingSettings(false));
  }, [user?.tenantId]);

  // 2. Update sections when class changes
  useEffect(() => {
    if (!form.classGrade) {
      setSections([]);
      return;
    }
    const selected = allClassesData.find(
      (c: any) => (c.name || c.classGrade || c) === form.classGrade
    );
    if (selected && Array.isArray(selected.sections)) {
      setSections(selected.sections);
    } else {
      setSections([]);
    }
    // reset section when class changes
    setForm((prev) => ({ ...prev, section: "" }));
  }, [form.classGrade, allClassesData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, photoBase64: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.classGrade) {
      setError("Full Name and Class are required.");
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
          section: form.section || "Unassigned",
        }),
      });
      if (res.ok) {
        router.push("/students");   // back to student list
      } else {
        const data = await res.json();
        setError(data.message || "Failed to add student");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingSettings) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
        <UserPlus className="text-blue-600" /> Add New Student
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Photo */}
        <div className="flex items-center gap-6">
          <div className="relative">
            {form.photoBase64 ? (
              <img src={form.photoBase64} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-gray-200" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                <Camera className="text-gray-400" size={32} />
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer">
              <Camera size={16} />
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
          <div className="text-sm text-gray-500">Upload student photo (optional)</div>
        </div>

        {/* Two‑column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700">Full Name *</label>
            <input type="text" name="fullName" value={form.fullName} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 mt-1" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700">Father's Name</label>
            <input type="text" name="fatherName" value={form.fatherName} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 mt-1" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700">Class *</label>
            <select name="classGrade" value={form.classGrade} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 mt-1" required>
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700">Section</label>
            <select name="section" value={form.section} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 mt-1" disabled={!form.classGrade}>
              <option value="">Select Section</option>
              {sections.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700">Roll Number</label>
            <input type="text" name="rollNumber" value={form.rollNumber} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 mt-1" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 mt-1">
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700">Date of Birth</label>
            <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 mt-1" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700">Phone</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 mt-1" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700">Address</label>
            <textarea name="address" rows={2} value={form.address} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 mt-1" />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {submitting ? "Saving..." : "Save Student"}
        </button>
      </form>
    </div>
  );
}
