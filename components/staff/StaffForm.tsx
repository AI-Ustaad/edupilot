"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Camera, Upload, Save } from "lucide-react";
import Image from "next/image";
import { useCreateStaff, useStaffOCR } from "@/hooks/useStaff";
import { useToast } from "@/components/ToastProvider";
import type { StaffFormData } from "@/lib/mappers/staff.mapper";
import { Input, Select, FormSection, DocumentUpload } from "./form-primitives";



export function useStaffForm() {
  const router = useRouter();
  const { user } = useAuth();
  const createMutation = useCreateStaff();
  const { showToast } = useToast();
  const { ocrUploading, openFilePicker } = useStaffOCR();

  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState("");

  const [form, setForm] = useState<StaffFormData>({
    personal: { fullName: "", fatherName: "", cnic: "", dob: "", gender: "Male", bloodGroup: "", nationality: "", religion: "", maritalStatus: "Single", photo: "" },
    contact: { mobile: "", whatsapp: "", email: "", currentAddress: "", permanentAddress: "", city: "", province: "", country: "", postalCode: "" },
    professional: { personnelNo: "", employeeId: "", designation: "", department: "", role: "", employmentType: "", joiningDate: "", confirmationDate: "", experience: "", qualification: "" },
    payroll: { basicSalary: 0, allowances: [], deductions: [], grossSalary: 0, bankName: "", accountNumber: "", iban: "", salaryPaymentMethod: "" },
    academic: { subjects: [], classesAssigned: [], timetable: "", sectionAssignment: "", classTeacher: false },
    emergency: { name: "", relation: "", phone: "", alternatePhone: "" },
    documents: { cnicFront: "", cnicBack: "", degree: "", experienceCert: "", cv: "" },
  });

  const handleChange = (section: string, field: string, value: any) => {
    setForm((prev) => ({ ...prev, [section]: { ...prev[section as keyof StaffFormData], [field]: value } }));
  };

  const setFormData = (data: StaffFormData) => setForm(data);

  const handleOCRUpload = () => {
    openFilePicker((staffFormData) => {
      setForm((prev) => ({
        ...prev,
        personal: { ...prev.personal, ...staffFormData.personal },
        contact: { ...prev.contact, ...staffFormData.contact },
        professional: { ...prev.professional, ...staffFormData.professional },
        payroll: { ...prev.payroll, ...staffFormData.payroll },
      }));
      setActiveTab(0);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Client-side validation for all required fields
    if (!form.personal.fullName || form.personal.fullName.trim().length < 2) {
      setError("Full Name is required (min 2 characters).");
      return;
    }
    if (!form.professional.personnelNo || form.professional.personnelNo.trim() === "") {
      setError("Personnel Number is required.");
      return;
    }
    if (!form.professional.designation || form.professional.designation.trim() === "") {
      setError("Designation is required.");
      return;
    }
    // Validate email format if provided
    if (form.contact.email && form.contact.email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.contact.email)) {
        setError("Please enter a valid email address.");
        return;
      }
    }
    setError("");
    createMutation.mutate({ ...form, tenantId: user?.tenantId, createdBy: user?.uid } as any, {
      onSuccess: () => router.push("/staff"),
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => handleChange("personal", "photo", reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const tabs = ["Basic Info", "Professional", "Financial", "Documents"];

  const renderForm = () => (
    <form onSubmit={handleSubmit}>
      {activeTab === 0 && (
        <FormSection title="Personal Information">
          <div className="col-span-2 flex items-center gap-4">
            <div className="relative">
              {form.personal.photo ? (
                <Image src={form.personal.photo} alt="Staff Photo" width={96} height={96} className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center"><Camera size={32} className="text-gray-400" /></div>
              )}
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer">
                <Upload size={14} />
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
            <Input label="Full Name *" value={form.personal.fullName} onChange={e => handleChange("personal", "fullName", e.target.value)} required />
          </div>
          <Input label="Father Name" value={form.personal.fatherName} onChange={e => handleChange("personal", "fatherName", e.target.value)} />
          <Input label="CNIC" value={form.personal.cnic} onChange={e => handleChange("personal", "cnic", e.target.value)} />
          <Input label="Date of Birth" type="date" value={form.personal.dob} onChange={e => handleChange("personal", "dob", e.target.value)} />
          <Select label="Gender" value={form.personal.gender} onChange={e => handleChange("personal", "gender", e.target.value)} options={["Male", "Female", "Other"]} />
          <Input label="Mobile" value={form.contact.mobile} onChange={e => handleChange("contact", "mobile", e.target.value)} />
          <Input label="Email" value={form.contact.email} onChange={e => handleChange("contact", "email", e.target.value)} />
        </FormSection>
      )}

      {activeTab === 1 && (
        <FormSection title="Professional Information">
          <Input label="Personnel No *" value={form.professional.personnelNo} onChange={e => handleChange("professional", "personnelNo", e.target.value)} required />
          <Input label="Designation *" value={form.professional.designation} onChange={e => handleChange("professional", "designation", e.target.value)} required />
          <Input label="Department" value={form.professional.department} onChange={e => handleChange("professional", "department", e.target.value)} />
          <Input label="Joining Date" type="date" value={form.professional.joiningDate} onChange={e => handleChange("professional", "joiningDate", e.target.value)} />
        </FormSection>
      )}

      {activeTab === 2 && (
        <FormSection title="Payroll & Financial">
          <Input label="Basic Salary" type="number" value={form.payroll.basicSalary} onChange={e => handleChange("payroll", "basicSalary", parseFloat(e.target.value) || 0)} />
          <Input label="Bank Name" value={form.payroll.bankName} onChange={e => handleChange("payroll", "bankName", e.target.value)} />
          <Input label="Account Number" value={form.payroll.accountNumber} onChange={e => handleChange("payroll", "accountNumber", e.target.value)} />
          <Select label="Payment Method" value={form.payroll.salaryPaymentMethod} onChange={e => handleChange("payroll", "salaryPaymentMethod", e.target.value)} options={["Bank Transfer", "Cash", "Cheque"]} />
        </FormSection>
      )}

      {activeTab === 3 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-gray-200">
          <h3 className="col-span-2 font-bold text-lg text-gray-800">Credentials & Documents</h3>
          <DocumentUpload label="CNIC Front" value={form.documents.cnicFront} onChange={(val) => handleChange("documents", "cnicFront", val)} />
          <DocumentUpload label="CNIC Back" value={form.documents.cnicBack} onChange={(val) => handleChange("documents", "cnicBack", val)} />
          <DocumentUpload label="Final Degree" value={form.documents.degree} onChange={(val) => handleChange("documents", "degree", val)} />
          <DocumentUpload label="Experience Certificate" value={form.documents.experienceCert} onChange={(val) => handleChange("documents", "experienceCert", val)} />
          <DocumentUpload label="CV / Resume" value={form.documents.cv} onChange={(val) => handleChange("documents", "cv", val)} />
        </div>
      )}

      <div className="mt-6 flex gap-4">
        {activeTab > 0 && (
          <button type="button" onClick={() => setActiveTab(activeTab - 1)} className="w-full bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold">Back</button>
        )}
        {activeTab < 3 ? (
          <button type="button" onClick={() => setActiveTab(activeTab + 1)} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold">Next</button>
        ) : (
          <button type="submit" disabled={createMutation.isPending} className="w-full bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50">
            {createMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Staff Record
          </button>
        )}
      </div>
    </form>
  );

  return {
    form,
    setForm: setFormData,
    activeTab,
    setActiveTab,
    error,
    ocrUploading,
    handleOCRUpload,
    handleSubmit,
    renderForm,
    createMutation,
  };
}
