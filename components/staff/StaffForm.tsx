"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Camera, Upload, Trash2, Save, UserPlus, FileText } from "lucide-react";
import Image from "next/image";
import { useCreateStaff } from "@/hooks/useStaff";
import { useToast } from "@/components/ToastProvider";
import { mapOCRToStaffForm } from "@/lib/ocr/mappers/staff.mapper";
import type { StaffFormData, OCRMetaData } from "@/lib/ocr/mappers/staff.mapper";

const Input = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label><input {...props} className="w-full p-2 border rounded-xl" /></div>
);

const Select = ({ label, options, ...props }: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label><select {...props} className="w-full p-2 border rounded-xl bg-white">{options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}</select></div>
);

const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-2xl border border-gray-200"><h3 className="col-span-2 font-bold text-lg text-gray-800">{title}</h3>{children}</div>
);

const DocumentUpload = ({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) => {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onChange(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const isImage = value.startsWith("data:image");

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center h-32 hover:border-blue-500 transition">
        <input type="file" accept="image/*,application/pdf,.docx" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer" />
        {value ? (
          isImage ? (
            <Image src={value} alt={label} width={80} height={80} className="object-contain p-2" />
          ) : (
            <div className="flex flex-col items-center text-gray-600">
              <FileText size={24} />
              <span className="text-xs mt-1">File Selected</span>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <Upload size={24} />
            <span className="text-xs mt-1">Click to Upload</span>
          </div>
        )}
      </div>
      {value && (
        <button type="button" onClick={() => onChange("")} className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <Trash2 size={12} /> Remove
        </button>
      )}
    </div>
  );
};



export function useStaffForm() {
  const router = useRouter();
  const { user } = useAuth();
  const createMutation = useCreateStaff();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState("");
  const [ocrUploading, setOcrUploading] = useState(false);

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

  const handleOCRUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,application/pdf";
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      setOcrUploading(true);
      showToast("Extracting data via OCR...", "info");
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/v1/staff/ocr", { method: "POST", body: formData });
        const result = await res.json();
        if (res.ok && result.success && result.data) {
          const { staffFormData } = mapOCRToStaffForm(result.data);
          setForm((prev) => ({
            ...prev,
            personal: { ...prev.personal, ...staffFormData.personal },
            contact: { ...prev.contact, ...staffFormData.contact },
            professional: { ...prev.professional, ...staffFormData.professional },
            payroll: { ...prev.payroll, ...staffFormData.payroll },
          }));
          showToast("Data extracted successfully! Please verify.", "success");
          setActiveTab(0);
        } else {
          showToast(result.error || "Failed to extract data.", "error");
        }
      } catch {
        showToast("Network error during OCR.", "error");
      } finally {
        setOcrUploading(false);
      }
    };
    input.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.personal.fullName) {
      setError("Full Name is required.");
      return;
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
