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
      // 🔥 FIX 1: Correct API URL
      const res = await fetch("/api/v1/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          fatherName: form.fatherName,
          cnic: form.cnic,
          dob: form.dob,
          gender: form.gender,
          bloodGroup: form.bloodGroup,
          religion: form.religion,
          nationality: form.nationality,
          phone: form.phone,
          email: form.email,
          address: form.address,
          classGrade: form.classGrade,
          section: form.section || undefined,          // empty string → undefined
          // 🔥 FIX 2: Convert to number (coerce will handle it, but explicit is safe)
          rollNumber: form.rollNumber ? Number(form.rollNumber) : undefined,
          admissionNumber: form.admissionNumber,
          guardianName: form.guardianName,
          guardianRelation: form.guardianRelation,
          guardianPhone: form.guardianPhone,
          previousSchool: form.previousSchool,
          medicalConditions: form.medicalConditions,
          photoBase64: form.photoBase64,
          tenantId: user?.tenantId,
          createdBy: user?.uid,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Student admitted successfully!");
        setTimeout(() => router.push("/students"), 1500);
      } else {
        // 🔥 FIX 3: Show actual server error
        setError(data.error || data.message || "Failed to admit student.");
      }
    } catch (err) {
      setError("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  // باقی کا UI وہی رکھیں (Input, Select components) …
  // (وہی کوڈ جو پہلے تھا)
}
