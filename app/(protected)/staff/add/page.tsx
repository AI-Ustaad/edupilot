"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Loader2, Camera, Upload, Plus, Trash2, Save, UserPlus
} from "lucide-react";

// Reusable components (اگر آپ کے پاس نہ ہوں تو شامل کریں)
const Input = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input {...props} className="w-full p-2 border rounded-xl" />
  </div>
);

const Select = ({ label, options, ...props }: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select {...props} className="w-full p-2 border rounded-xl bg-white">
      {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-2xl border border-gray-200">
    <h3 className="col-span-2 font-bold text-lg text-gray-800">{title}</h3>
    {children}
  </div>
);

export default function AddStaffPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState<any>({
    personal: {
      fullName: "", fatherName: "", cnic: "", dob: "",
      gender: "Male", bloodGroup: "", nationality: "", religion: "",
      maritalStatus: "Single", photo: "",
    },
    contact: {
      mobile: "", whatsapp: "", email: "", currentAddress: "",
      permanentAddress: "", city: "", province: "", country: "", postalCode: "",
    },
    professional: {
      personnelNo: "", employeeId: "", designation: "", department: "",
      role: "", employmentType: "", joiningDate: "", confirmationDate: "",
      experience: "", qualification: "",
    },
    payroll: {
      basicSalary: 0,
      allowances: [{ name: "", amount: 0 }],
      deductions: [{ name: "", amount: 0 }],
      grossSalary: 0,
      bankName: "", accountNumber: "", iban: "", salaryPaymentMethod: "",
    },
    education: [] as any[],
    academic: {
      subjects: [] as string[],
      classesAssigned: [] as string[],
      timetable: "",
      sectionAssignment: "",
      classTeacher: false,
    },
    emergency: { name: "", relation: "", phone: "", alternatePhone: "" },
    documents: {
      cnicFront: "", cnicBack: "",
      degreeCertificates: [] as string[],
      experienceCertificates: [] as string[],
      appointmentLetter: "", contract: "", cv: "",
    },
  });

  const handleChange = (section: string, field: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => handleChange("personal", "photo", reader.result as string);
      reader.readAsDataURL(file);
    }
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
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tenantId: user?.tenantId, createdBy: user?.uid }),
      });
      const json = await res.json();
      if (res.ok) {
        setSuccess("Staff added successfully!");
        setTimeout(() => router.push("/staff"), 1500);
      } else {
        setError(json.message || "Failed to add staff.");
      }
    } catch (err) {
      setError("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { label: "Basic Info", icon: "👤" },
    { label: "Professional", icon: "💼" },
    { label: "Education", icon: "🎓" },
    { label: "Financial", icon: "💰" },
    { label: "Documents", icon: "📄" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
        <UserPlus className="text-blue-600" /> Add New Staff Member
      </h1>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl font-bold">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 p-3 rounded-xl font-bold">{success}</div>}

      <div className="flex gap-1">
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
                  <img src={form.personal.photo} className="w-24 h-24 rounded-full object-cover" />
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
              <Input label="Full Name *" value={form.personal.fullName} onChange={e => handleChange("personal", "fullName", e.target.value)} required />
            </div>
            <Input label="Father / Husband Name" value={form.personal.fatherName} onChange={e => handleChange("personal", "fatherName", e.target.value)} />
            <Input label="CNIC" value={form.personal.cnic} onChange={e => handleChange("personal", "cnic", e.target.value)} />
            <Input label="Date of Birth" type="date" value={form.personal.dob} onChange={e => handleChange("personal", "dob", e.target.value)} />
            <Select label="Gender" value={form.personal.gender} onChange={e => handleChange("personal", "gender", e.target.value)} options={["Male", "Female", "Other"]} />
            <Input label="Blood Group" value={form.personal.bloodGroup} onChange={e => handleChange("personal", "bloodGroup", e.target.value)} />
            <Input label="Nationality" value={form.personal.nationality} onChange={e => handleChange("personal", "nationality", e.target.value)} />
            <Input label="Religion" value={form.personal.religion} onChange={e => handleChange("personal", "religion", e.target.value)} />
            <Select label="Marital Status" value={form.personal.maritalStatus} onChange={e => handleChange("personal", "maritalStatus", e.target.value)} options={["Single", "Married", "Divorced", "Widowed"]} />

            <h4 className="col-span-2 text-lg font-bold mt-4">Contact Details</h4>
            <Input label="Mobile" value={form.contact.mobile} onChange={e => handleChange("contact", "mobile", e.target.value)} />
            <Input label="WhatsApp" value={form.contact.whatsapp} onChange={e => handleChange("contact", "whatsapp", e.target.value)} />
            <Input label="Email" value={form.contact.email} onChange={e => handleChange("contact", "email", e.target.value)} />
            <Input label="Current Address" value={form.contact.currentAddress} onChange={e => handleChange("contact", "currentAddress", e.target.value)} />
            <Input label="Permanent Address" value={form.contact.permanentAddress} onChange={e => handleChange("contact", "permanentAddress", e.target.value)} />
            <Input label="City" value={form.contact.city} onChange={e => handleChange("contact", "city", e.target.value)} />
            <Input label="Province" value={form.contact.province} onChange={e => handleChange("contact", "province", e.target.value)} />
            <Input label="Country" value={form.contact.country} onChange={e => handleChange("contact", "country", e.target.value)} />
            <Input label="Postal Code" value={form.contact.postalCode} onChange={e => handleChange("contact", "postalCode", e.target.value)} />

            <h4 className="col-span-2 text-lg font-bold mt-4">Emergency Contact</h4>
            <Input label="Name" value={form.emergency.name} onChange={e => handleChange("emergency", "name", e.target.value)} />
            <Input label="Relation" value={form.emergency.relation} onChange={e => handleChange("emergency", "relation", e.target.value)} />
            <Input label="Phone" value={form.emergency.phone} onChange={e => handleChange("emergency", "phone", e.target.value)} />
            <Input label="Alternate Phone" value={form.emergency.alternatePhone} onChange={e => handleChange("emergency", "alternatePhone", e.target.value)} />
          </Section>
        )}

        {/* TAB 1: Professional */}
        {activeTab === 1 && (
          <Section title="Professional Information">
            <Input label="Personnel No *" value={form.professional.personnelNo} onChange={e => handleChange("professional", "personnelNo", e.target.value)} required />
            <Input label="Employee ID" value={form.professional.employeeId} onChange={e => handleChange("professional", "employeeId", e.target.value)} />
            <Input label="Designation *" value={form.professional.designation} onChange={e => handleChange("professional", "designation", e.target.value)} required />
            <Input label="Department" value={form.professional.department} onChange={e => handleChange("professional", "department", e.target.value)} />
            <Input label="Role" value={form.professional.role} onChange={e => handleChange("professional", "role", e.target.value)} />
            <Input label="Employment Type" value={form.professional.employmentType} onChange={e => handleChange("professional", "employmentType", e.target.value)} />
            <Input label="Joining Date" type="date" value={form.professional.joiningDate} onChange={e => handleChange("professional", "joiningDate", e.target.value)} />
            <Input label="Confirmation Date" type="date" value={form.professional.confirmationDate} onChange={e => handleChange("professional", "confirmationDate", e.target.value)} />
            <Input label="Experience (years)" value={form.professional.experience} onChange={e => handleChange("professional", "experience", e.target.value)} />
            <Input label="Qualification" value={form.professional.qualification} onChange={e => handleChange("professional", "qualification", e.target.value)} />

            <h4 className="col-span-2 text-lg font-bold mt-4">Academic Assignment</h4>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Subjects (comma separated)</label>
              <input
                value={form.academic.subjects.join(",")}
                onChange={e => handleChange("academic", "subjects", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))}
                className="w-full p-2 border rounded-xl"
                placeholder="Math, Science, etc."
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Classes Assigned (comma separated)</label>
              <input
                value={form.academic.classesAssigned.join(",")}
                onChange={e => handleChange("academic", "classesAssigned", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))}
                className="w-full p-2 border rounded-xl"
                placeholder="9A, 10B, etc."
              />
            </div>
            <Input label="Timetable" value={form.academic.timetable} onChange={e => handleChange("academic", "timetable", e.target.value)} />
            <Input label="Section Assignment" value={form.academic.sectionAssignment} onChange={e => handleChange("academic", "sectionAssignment", e.target.value)} />
            <div className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.academic.classTeacher}
                onChange={e => handleChange("academic", "classTeacher", e.target.checked)}
              />
              <label className="text-sm font-medium text-gray-700">Is Class Teacher?</label>
            </div>
          </Section>
        )}

        {/* TAB 2: Education */}
        {activeTab === 2 && (
          <Section title="Education History">
            {form.education.map((edu: any, idx: number) => (
              <div key={idx} className="col-span-2 border p-3 rounded-lg relative mb-2">
                <button
                  type="button"
                  onClick={() => {
                    const newEdu = [...form.education];
                    newEdu.splice(idx, 1);
                    setForm((prev: any) => ({ ...prev, education: newEdu }));
                  }}
                  className="absolute top-2 right-2 text-red-500"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label="Level"
                    value={edu.level}
                    onChange={e => { const arr = [...form.education]; arr[idx].level = e.target.value; setForm((prev: any) => ({ ...prev, education: arr })); }}
                  />
                  <Input
                    label="Institute"
                    value={edu.institute}
                    onChange={e => { const arr = [...form.education]; arr[idx].institute = e.target.value; setForm((prev: any) => ({ ...prev, education: arr })); }}
                  />
                  <Input
                    label="Passing Year"
                    value={edu.passingYear}
                    onChange={e => { const arr = [...form.education]; arr[idx].passingYear = e.target.value; setForm((prev: any) => ({ ...prev, education: arr })); }}
                  />
                  <Input
                    label="Subjects"
                    value={edu.subjects}
                    onChange={e => { const arr = [...form.education]; arr[idx].subjects = e.target.value; setForm((prev: any) => ({ ...prev, education: arr })); }}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setForm((prev: any) => ({ ...prev, education: [...prev.education, { level: "", institute: "", passingYear: "", subjects: "" }] }))}
              className="col-span-2 text-blue-600 font-bold flex items-center gap-1"
            >
              <Plus size={16} /> Add Education
            </button>
          </Section>
        )}

        {/* TAB 3: Financial */}
        {activeTab === 3 && (
          <Section title="Payroll & Financial">
            <Input label="Basic Salary" type="number" value={form.payroll.basicSalary} onChange={e => handleChange("payroll", "basicSalary", parseFloat(e.target.value) || 0)} />
            <Input label="Bank Name" value={form.payroll.bankName} onChange={e => handleChange("payroll", "bankName", e.target.value)} />
            <Input label="Account Number" value={form.payroll.accountNumber} onChange={e => handleChange("payroll", "accountNumber", e.target.value)} />
            <Input label="IBAN" value={form.payroll.iban} onChange={e => handleChange("payroll", "iban", e.target.value)} />
            <Select
              label="Salary Payment Method"
              value={form.payroll.salaryPaymentMethod}
              onChange={e => handleChange("payroll", "salaryPaymentMethod", e.target.value)}
              options={["Bank Transfer", "Cash", "Cheque"]}
            />

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Allowances</label>
              {form.payroll.allowances.map((allow: any, idx: number) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    placeholder="Name"
                    value={allow.name}
                    onChange={e => { const arr = [...form.payroll.allowances]; arr[idx].name = e.target.value; setForm((prev: any) => ({ ...prev, payroll: { ...prev.payroll, allowances: arr } })); }}
                    className="flex-1 p-2 border rounded-xl"
                  />
                  <input
                    placeholder="Amount"
                    type="number"
                    value={allow.amount}
                    onChange={e => { const arr = [...form.payroll.allowances]; arr[idx].amount = parseFloat(e.target.value) || 0; setForm((prev: any) => ({...prev, payroll: { ...prev.payroll, allowances: arr } })); }}
                    className="w-24 p-2 border rounded-xl"
                  />
                  <button type="button" onClick={() => { const arr = form.payroll.allowances.filter((_: any, i: number) => i !== idx); setForm((prev: any) => ({ ...prev, payroll: { ...prev.payroll, allowances: arr } })); }} className="text-red-500"><Trash2 size={16} /></button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setForm((prev: any) => ({ ...prev, payroll: { ...prev.payroll, allowances: [...prev.payroll.allowances, { name: "", amount: 0 }] } }))}
                className="text-blue-600 font-bold text-sm"
              >
                + Add Allowance
              </button>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Deductions</label>
              {form.payroll.deductions.map((ded: any, idx: number) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    placeholder="Name"
                    value={ded.name}
                    onChange={e => { const arr = [...form.payroll.deductions]; arr[idx].name = e.target.value; setForm((prev: any) => ({ ...prev, payroll: { ...prev.payroll, deductions: arr } })); }}
                    className="flex-1 p-2 border rounded-xl"
                  />
                  <input
                    placeholder="Amount"
                    type="number"
                    value={ded.amount}
                    onChange={e => { const arr = [...form.payroll.deductions]; arr[idx].amount = parseFloat(e.target.value) || 0; setForm((prev: any) => ({...prev, payroll: { ...prev.payroll, deductions: arr } })); }}
                    className="w-24 p-2 border rounded-xl"
                  />
                  <button type="button" onClick={() => { const arr = form.payroll.deductions.filter((_: any, i: number) => i !== idx); setForm((prev: any) => ({ ...prev, payroll: { ...prev.payroll, deductions: arr } })); }} className="text-red-500"><Trash2 size={16} /></button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setForm((prev: any) => ({ ...prev, payroll: { ...prev.payroll, deductions: [...prev.payroll.deductions, { name: "", amount: 0 }] } }))}
                className="text-blue-600 font-bold text-sm"
              >
                + Add Deduction
              </button>
            </div>

            <div className="col-span-2 p-4 bg-gray-50 rounded-xl">
              <span className="font-bold text-lg">Net Pay: Rs. {calcNetPay().toLocaleString()}</span>
            </div>
          </Section>
        )}

        {/* TAB 4: Documents */}
        {activeTab === 4 && (
          <Section title="Documents Upload">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">CNIC Front (Base64/URL)</label>
              <input value={form.documents.cnicFront} onChange={e => handleChange("documents", "cnicFront", e.target.value)} className="w-full p-2 border rounded-xl" placeholder="Paste Base64 or URL" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">CNIC Back (Base64/URL)</label>
              <input value={form.documents.cnicBack} onChange={e => handleChange("documents", "cnicBack", e.target.value)} className="w-full p-2 border rounded-xl" placeholder="Paste Base64 or URL" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Letter (URL)</label>
              <input value={form.documents.appointmentLetter} onChange={e => handleChange("documents", "appointmentLetter", e.target.value)} className="w-full p-2 border rounded-xl" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Contract (URL)</label>
              <input value={form.documents.contract} onChange={e => handleChange("documents", "contract", e.target.value)} className="w-full p-2 border rounded-xl" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">CV (URL)</label>
              <input value={form.documents.cv} onChange={e => handleChange("documents", "cv", e.target.value)} className="w-full p-2 border rounded-xl" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Degree Certificates (comma separated URLs)</label>
              <input
                value={form.documents.degreeCertificates.join(", ")}
                onChange={e => handleChange("documents", "degreeCertificates", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))}
                className="w-full p-2 border rounded-xl"
                placeholder="URL1, URL2"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience Certificates (comma separated URLs)</label>
              <input
                value={form.documents.experienceCertificates.join(", ")}
                onChange={e => handleChange("documents", "experienceCertificates", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))}
                className="w-full p-2 border rounded-xl"
                placeholder="URL1, URL2"
              />
            </div>
          </Section>
        )}

        <div className="mt-6">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {submitting ? "Saving..." : "Save Staff Record"}
          </button>
        </div>
      </form>
    </div>
  );
}
