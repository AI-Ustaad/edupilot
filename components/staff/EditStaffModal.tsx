"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Loader2, Briefcase, Mail, Phone, DollarSign, Award, BookOpen, Layers } from "lucide-react";
import { useUpdateStaff } from "@/hooks/useStaff";
import { useClasses } from "@/hooks/useClasses";
import { useToast } from "@/components/ToastProvider";

interface EditStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: any;
  onSuccess?: () => void;
}

export default function EditStaffModal({ isOpen, onClose, staff, onSuccess }: EditStaffModalProps) {
  const { data: classesData = [] } = useClasses();
  const updateMutation = useUpdateStaff();
  const { showToast } = useToast();

  const getInitialForm = (stf: any) => {
    const personal = stf?.personal || {};
    const contact = stf?.contact || {};
    const professional = stf?.professional || {};
    const payroll = stf?.payroll || {};
    const academic = stf?.academic || {};

    return {
      fullName: personal.fullName || stf?.fullName || stf?.name || "",
      email: contact.email || stf?.email || "",
      mobile: contact.mobile || stf?.phone || stf?.mobile || "",
      designation: professional.designation || stf?.designation || "Teacher",
      department: professional.department || stf?.department || "",
      qualification: professional.qualification || stf?.qualification || "",
      basicSalary: payroll.basicSalary || stf?.salary || stf?.basicSalary || 0,
      classesAssigned: Array.isArray(academic.classesAssigned)
        ? academic.classesAssigned
        : (stf?.classesAssigned ? [stf.classesAssigned] : []),
      sectionAssignment: academic.sectionAssignment || stf?.section || "A",
      status: (stf?.status || "active").toLowerCase(),
    };
  };

  const [form, setForm] = useState(() => getInitialForm(staff));

  useEffect(() => {
    if (staff) {
      setForm(getInitialForm(staff));
    }
  }, [staff]);

  if (!isOpen || !staff) return null;

  const availableClasses = Array.from(
    new Set(classesData.map((c: any) => c.classGrade as string).filter(Boolean))
  );

  const availableSections = Array.from(
    new Set(classesData.map((c: any) => c.sectionName as string).filter(Boolean))
  );
  if (!availableSections.length) availableSections.push("A", "B", "C", "D");

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleClass = (cls: string) => {
    setForm(prev => {
      const exists = prev.classesAssigned.includes(cls);
      return {
        ...prev,
        classesAssigned: exists
          ? prev.classesAssigned.filter(c => c !== cls)
          : [...prev.classesAssigned, cls]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      showToast("Full name is required", "error");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: staff.id,
        data: form,
      });
      showToast("Staff record updated and synchronized across all modules!", "success");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      showToast(err?.message || "Failed to update staff record", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Briefcase className="text-blue-600" size={22} /> Edit Staff Member
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Assigned classes and designations synchronize automatically with section rosters and user accounts.
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
          {/* Section: Professional Profile */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase size={15} /> Professional Profile
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
                  placeholder="e.g. Sarah Jenkins"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Designation / Role *</label>
                <select
                  value={form.designation}
                  onChange={e => handleChange("designation", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                >
                  <option value="Teacher">Teacher</option>
                  <option value="Senior Teacher">Senior Teacher</option>
                  <option value="Subject Specialist">Subject Specialist</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Admin">Admin</option>
                  <option value="Principal">Principal</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={form.department}
                  onChange={e => handleChange("department", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  placeholder="e.g. Science / Mathematics"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Qualification</label>
                <input
                  type="text"
                  value={form.qualification}
                  onChange={e => handleChange("qualification", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  placeholder="e.g. M.Sc. Physics"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Basic Salary (Rs)</label>
                <input
                  type="number"
                  min="0"
                  value={form.basicSalary}
                  onChange={e => handleChange("basicSalary", parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Employment Status</label>
                <select
                  value={form.status}
                  onChange={e => handleChange("status", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                >
                  <option value="active">Active</option>
                  <option value="on-leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Academic Allocation */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen size={15} /> Assigned Classes & Sections
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Assigned Classes</label>
              {availableClasses.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {availableClasses.map((cls) => {
                    const isSelected = form.classesAssigned.includes(cls);
                    return (
                      <button
                        type="button"
                        key={cls}
                        onClick={() => toggleClass(cls)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {cls}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No classes configured yet.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Primary Section Assignment</label>
              <select
                value={form.sectionAssignment}
                onChange={e => handleChange("sectionAssignment", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              >
                {availableSections.map((sec) => (
                  <option key={sec} value={sec}>Section {sec}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section: Contact Details */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Phone size={15} /> Contact Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => handleChange("email", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  placeholder="e.g. teacher@school.edu"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone / Mobile</label>
                <input
                  type="tel"
                  value={form.mobile}
                  onChange={e => handleChange("mobile", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  placeholder="e.g. +92 300 1234567"
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
                  <Save size={16} /> Save & Sync Staff
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
