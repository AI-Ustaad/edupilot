"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Loader2, User, GraduationCap, Phone, Mail, DollarSign, Calendar, MapPin, Activity } from "lucide-react";
import { useUpdateStudent } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import { useToast } from "@/components/ToastProvider";

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  onSuccess?: () => void;
}

export default function EditStudentModal({ isOpen, onClose, student, onSuccess }: EditStudentModalProps) {
  const { data: classesData = [] } = useClasses();
  const updateMutation = useUpdateStudent();
  const { showToast } = useToast();

  const getInitialForm = (st: any) => ({
    fullName: st?.fullName || st?.name || "",
    rollNumber: st?.rollNumber !== undefined ? String(st.rollNumber) : "",
    classGrade: st?.classGrade || st?.className || "",
    section: st?.section || "A",
    guardianName: st?.guardianName || st?.fatherName || "",
    guardianPhone: st?.guardianPhone || st?.phone || "",
    guardianEmail: st?.guardianEmail || st?.email || "",
    monthlyFee: st?.monthlyFee !== undefined ? Number(st.monthlyFee) : 5000,
    dob: st?.dob || st?.dateOfBirth || "",
    gender: st?.gender || "Male",
    address: st?.address || "",
    status: (st?.status || "active").toLowerCase(),
  });

  const [form, setForm] = useState(() => getInitialForm(student));

  useEffect(() => {
    if (student) {
      setForm(getInitialForm(student));
    }
  }, [student]);

  if (!isOpen || !student) return null;

  // Extract unique classes and sections
  const availableClasses = Array.from(
    new Set(classesData.map((c: any) => c.classGrade as string).filter(Boolean))
  );
  if (form.classGrade && !availableClasses.includes(form.classGrade)) {
    availableClasses.push(form.classGrade);
  }

  const availableSections = Array.from(
    new Set(classesData.map((c: any) => c.sectionName as string).filter(Boolean))
  );
  if (!availableSections.length) {
    availableSections.push("A", "B", "C", "D");
  } else if (!availableSections.includes(form.section)) {
    availableSections.push(form.section);
  }

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      showToast("Student full name is required", "error");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: student.id,
        data: form,
      });
      showToast("Student profile updated and synchronized across all modules!", "success");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      showToast(err?.message || "Failed to update student", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <User className="text-blue-600" size={22} /> Edit Student Profile
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Updates propagate automatically to class rosters, fees, attendance, and exam marks.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Section: Academic Identity */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap size={15} /> Academic & Personal Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={e => handleChange("fullName", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Roll Number</label>
                <input
                  type="text"
                  value={form.rollNumber}
                  onChange={e => handleChange("rollNumber", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  placeholder="e.g. 101"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Class / Grade *</label>
                <select
                  value={form.classGrade}
                  onChange={e => handleChange("classGrade", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                >
                  <option value="">Select Class</option>
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Section</label>
                <select
                  value={form.section}
                  onChange={e => handleChange("section", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                >
                  {availableSections.map((sec) => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Gender</label>
                <select
                  value={form.gender}
                  onChange={e => handleChange("gender", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={e => handleChange("dob", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => handleChange("status", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="graduated">Graduated</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Monthly Fee (Rs)</label>
                <input
                  type="number"
                  min="0"
                  value={form.monthlyFee}
                  onChange={e => handleChange("monthlyFee", parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Section: Guardian / Contact */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Phone size={15} /> Guardian & Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Guardian Name</label>
                <input
                  type="text"
                  value={form.guardianName}
                  onChange={e => handleChange("guardianName", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  placeholder="e.g. Robert Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Guardian Phone</label>
                <input
                  type="tel"
                  value={form.guardianPhone}
                  onChange={e => handleChange("guardianPhone", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  placeholder="e.g. +92 300 1234567"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Guardian Email</label>
                <input
                  type="email"
                  value={form.guardianEmail}
                  onChange={e => handleChange("guardianEmail", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  placeholder="e.g. guardian@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => handleChange("address", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  placeholder="e.g. 123 School Lane, City"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 transition shadow-md disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving & Syncing...
                </>
              ) : (
                <>
                  <Save size={16} /> Save & Sync Student
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
