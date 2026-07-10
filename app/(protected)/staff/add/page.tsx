"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Camera, Upload, Plus, Trash2, Save, UserPlus, FileText } from "lucide-react";
import Image from "next/image";
import { useCreateStaff } from "@/hooks/useStaff";
import { useToast } from "@/components/ToastProvider";
import { mapOCRToStaffForm } from "@/lib/mappers/staff.mapper";
import { logger } from "@/lib/logger/logger";

// Reusable UI Components
const Input = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label><input {...props} className="w-full p-2 border rounded-xl" /></div>
);
const Select = ({ label, options, ...props }: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label><select {...props} className="w-full p-2 border rounded-xl bg-white">{options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}</select></div>
);
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-2xl border border-gray-200"><h3 className="col-span-2 font-bold text-lg text-gray-800">{title}</h3>{children}</div>
);

// Reusable Document/Image Upload Component
const DocumentUpload = ({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) => {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onChange(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const isImage = value.startsWith('data:image');
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center h-32 hover:border-blue-500 transition">
        <input type="file" accept="image/*,application/pdf,.docx" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer" />
        {value ? (
          isImage ? (
            <Image src={value} alt={label} layout="fill" objectFit="contain" className="p-2" />
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

export default function AddStaffPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createMutation = useCreateStaff();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState("");
  const [ocrUploading, setOcrUploading] = useState(false);

  const [form, setForm] = useState<any>({
    personal: { fullName: "", fatherName: "", cnic: "", dob: "", gender: "Male", bloodGroup: "", nationality: "", religion: "", maritalStatus: "Single", photo: "" },
    contact: { mobile: "", whatsapp: "", email: "", currentAddress: "", permanentAddress: "", city: "", province: "", country: "", postalCode: "" },
    professional: { personnelNo: "", employeeId: "", designation: "", department: "", role: "", employmentType: "", joiningDate: "", confirmationDate: "", experience: "", qualification: "" },
    payroll: { basicSalary: 0, allowances: [], deductions: [], grossSalary: 0, bankName: "", accountNumber: "", iban: "", salaryPaymentMethod: "" },
    education: [] as any[],
    academic: { subjects: [] as string[], classesAssigned: [] as string[], timetable: "", sectionAssignment: "", classTeacher: false },
    emergency: { name: "", relation: "", phone: "", alternatePhone: "" },
    documents: { 
      cnicFront: "", 
      cnicBack: "", 
      degree: "", 
      experienceCert: "", 
      cv: "" 
    },
  });

  const handleChange = (section: string, field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => handleChange("personal", "photo", reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 🚀 Fast Server-Side OCR Handler (Google Gemini API)
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
        
        logger.info("AI Extracted Data:", { metadata: { data: result.data } });

        if (res.ok && result.success && result.data) {
          const { staffFormData } = mapOCRToStaffForm(result.data);
          setForm((prev: any) => ({
            ...prev,
            personal: { ...prev.personal, ...staffFormData.personal },
            contact: { ...prev.contact, ...staffFormData.contact },
            professional: { ...prev.professional, ...staffFormData.professional },
            payroll: { ...prev.payroll, ...staffFormData.payroll },
          }));
          
          showToast("Data extracted successfully! Please verify.", "success");
          setActiveTab(0); // Switch to Basic Info tab
        } else {
          showToast(result.error || "Failed to extract data.", "error");
        }
      } catch (err) {
        showToast("Network error during OCR.", "error");
      } finally {
        setOcrUploading(false);
      }
    };
    input.click();
  };

  const calcNetPay = () => {
    const basic = form.payroll.basicSalary || 0;
    const allowances = form.payroll.allowances.reduce((sum: number, a: any) => sum + (a.amount || 0), 0);
    const deductions = form.payroll.deductions.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
    return basic + allowances - deductions;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.personal.fullName) {
      setError("Full Name is required.");
      return;
    }
    setError("");
    const payload = { ...form, tenantId: user?.tenantId, createdBy: user?.uid };
    logger.info("[AddStaff] Submitting payload", {
      metadata: { payroll: payload.payroll, allowances: payload.payroll?.allowances, deductions: payload.payroll?.deductions },
    });
    createMutation.mutate(
      payload,
      { onSuccess: () => router.push("/staff") }
    );
  };

  const tabs = [
    { label: "Basic Info" },
    { label: "Professional" },
    { label: "Financial" },
    { label: "Documents" }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <UserPlus className="text-blue-600" /> Add New Staff Member
        </h1>
        
        {/* 🚀 OCR Auto-Fill Button */}
        <button 
          onClick={handleOCRUpload} 
          disabled={ocrUploading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition disabled:opacity-50 shadow-sm"
        >
          {ocrUploading ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
          {ocrUploading ? "Extracting Data..." : "Upload Document (OCR)"}
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl font-bold">{error}</div>}

      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`flex-1 py-2 font-bold text-sm uppercase tracking-wider rounded-t-lg transition ${
              activeTab === idx ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* TAB 0: Basic Info */}
        {activeTab === 0 && (
          <Section title="Personal Information">
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
          </Section>
        )}
        
        {/* TAB 1: Professional */}
        {activeTab === 1 && (
          <Section title="Professional Information">
            <Input label="Personnel No *" value={form.professional.personnelNo} onChange={e => handleChange("professional", "personnelNo", e.target.value)} required />
            <Input label="Designation *" value={form.professional.designation} onChange={e => handleChange("professional", "designation", e.target.value)} required />
            <Input label="Department" value={form.professional.department} onChange={e => handleChange("professional", "department", e.target.value)} />
            <Input label="Joining Date" type="date" value={form.professional.joiningDate} onChange={e => handleChange("professional", "joiningDate", e.target.value)} />
          </Section>
        )}

        {/* TAB 2: Financial */}
        {activeTab === 2 && (
          <Section title="Payroll & Financial">
            <Input label="Basic Salary" type="number" value={form.payroll.basicSalary} onChange={e => handleChange("payroll", "basicSalary", parseFloat(e.target.value) || 0)} />
            <Input label="Bank Name" value={form.payroll.bankName} onChange={e => handleChange("payroll", "bankName", e.target.value)} />
            <Input label="Account Number" value={form.payroll.accountNumber} onChange={e => handleChange("payroll", "accountNumber", e.target.value)} />
            <Select label="Payment Method" value={form.payroll.salaryPaymentMethod} onChange={e => handleChange("payroll", "salaryPaymentMethod", e.target.value)} options={["Bank Transfer", "Cash", "Cheque"]} />
            <div className="col-span-2 p-4 bg-gray-50 rounded-xl"><span className="font-bold text-lg">Net Pay: Rs. {calcNetPay().toLocaleString()}</span></div>
          </Section>
        )}

        {/* TAB 3: Documents (Upload All Formats) */}
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
            <button type="button" onClick={() => setActiveTab(activeTab - 1)} className="w-full bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold">
              Back
            </button>
          )}
          {activeTab < 3 ? (
             <button type="button" onClick={() => setActiveTab(activeTab + 1)} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold">
               Next
             </button>
          ) : (
            <button type="submit" disabled={createMutation.isPending} className="w-full bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50">
              {createMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Staff Record
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
