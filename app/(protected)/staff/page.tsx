"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ChevronDown } from "lucide-react";

export default function AddStaffPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("personal");

  const [form, setForm] = useState<any>({
    personal: {
      fullName: "", fatherName: "", cnic: "", dob: "",
      gender: "Male", bloodGroup: "", nationality: "",
      religion: "", maritalStatus: "Single", photo: "",
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
      allowances: { houseRent: 0, medical: 0, transport: 0 },
      grossSalary: 0,
      bankName: "", accountNumber: "", iban: "", salaryPaymentMethod: "",
    },
    academic: {
      subjects: [] as string[], classesAssigned: [] as string[],
      timetable: "", sectionAssignment: "", classTeacher: false,
    },
    attendance: {
      presentDays: 0, absentDays: 0, lateArrivals: 0,
      leaves: 0, attendancePercent: 0,
    },
    leaves: {
      casualLeaves: 0, medicalLeaves: 0, annualLeaves: 0, remainingLeaves: 0,
    },
    documents: {
      cnicFront: "", cnicBack: "",
      degreeCertificates: [] as string[],
      experienceCertificates: [] as string[],
      appointmentLetter: "", contract: "", cv: "",
    },
    emergency: {
      name: "", relation: "", phone: "", alternatePhone: "",
    },
    performance: {
      score: 0, principalRemarks: "", warnings: 0,
      achievements: [] as string[],
      promotions: [] as string[],
      trainingHistory: [] as string[],
    },
  });

  const handleChange = (section: string, field: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleNestedChange = (section: string, parent: string, field: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parent]: { ...prev[section][parent], [field]: value },
      },
    }));
  };

  const handleArrayAdd = (section: string, field: string) => {
    setForm((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], [field]: [...prev[section][field], ""] },
    }));
  };

  const handleArrayChange = (section: string, field: string, index: number, value: string) => {
    const newArray = [...form[section][field]];
    newArray[index] = value;
    setForm((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], [field]: newArray },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push("/staff");
      } else {
        const err = await res.json();
        setError(err.message || err.error || "Failed to save staff");
      }
    } catch (err) {
      setError("Network error – please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    "personal", "contact", "professional", "payroll",
    "academic", "attendance", "leaves", "documents",
    "emergency", "performance",
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-black text-gray-900">Add Staff Member</h1>
      {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl font-bold">{error}</div>}

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1 border-b border-gray-200 pb-1">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-sm font-bold uppercase tracking-wider rounded-t-lg transition ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* PERSONAL */}
        {activeTab === "personal" && (
          <Section title="Personal Information">
            <Input label="Full Name *" value={form.personal.fullName} onChange={e => handleChange("personal", "fullName", e.target.value)} required />
            <Input label="Father / Husband Name" value={form.personal.fatherName} onChange={e => handleChange("personal", "fatherName", e.target.value)} />
            <Input label="CNIC (12345-1234567-1)" value={form.personal.cnic} onChange={e => handleChange("personal", "cnic", e.target.value)} />
            <Input label="Date of Birth (YYYY-MM-DD)" value={form.personal.dob} onChange={e => handleChange("personal", "dob", e.target.value)} />
            <Select label="Gender" value={form.personal.gender} onChange={e => handleChange("personal", "gender", e.target.value)} options={["Male", "Female", "Other"]} />
            <Input label="Blood Group" value={form.personal.bloodGroup} onChange={e => handleChange("personal", "bloodGroup", e.target.value)} />
            <Input label="Nationality" value={form.personal.nationality} onChange={e => handleChange("personal", "nationality", e.target.value)} />
            <Input label="Religion" value={form.personal.religion} onChange={e => handleChange("personal", "religion", e.target.value)} />
            <Select label="Marital Status" value={form.personal.maritalStatus} onChange={e => handleChange("personal", "maritalStatus", e.target.value)} options={["Single", "Married", "Divorced", "Widowed"]} />
          </Section>
        )}

        {/* CONTACT */}
        {activeTab === "contact" && (
          <Section title="Contact Information">
            <Input label="Mobile" value={form.contact.mobile} onChange={e => handleChange("contact", "mobile", e.target.value)} />
            <Input label="WhatsApp" value={form.contact.whatsapp} onChange={e => handleChange("contact", "whatsapp", e.target.value)} />
            <Input label="Email" value={form.contact.email} onChange={e => handleChange("contact", "email", e.target.value)} type="email" />
            <Input label="Current Address" value={form.contact.currentAddress} onChange={e => handleChange("contact", "currentAddress", e.target.value)} />
            <Input label="Permanent Address" value={form.contact.permanentAddress} onChange={e => handleChange("contact", "permanentAddress", e.target.value)} />
            <Input label="City" value={form.contact.city} onChange={e => handleChange("contact", "city", e.target.value)} />
            <Input label="Province" value={form.contact.province} onChange={e => handleChange("contact", "province", e.target.value)} />
            <Input label="Country" value={form.contact.country} onChange={e => handleChange("contact", "country", e.target.value)} />
            <Input label="Postal Code" value={form.contact.postalCode} onChange={e => handleChange("contact", "postalCode", e.target.value)} />
          </Section>
        )}

        {/* PROFESSIONAL */}
        {activeTab === "professional" && (
          <Section title="Professional Information">
            <Input label="Personnel No *" value={form.professional.personnelNo} onChange={e => handleChange("professional", "personnelNo", e.target.value)} required />
            <Input label="Employee ID" value={form.professional.employeeId} onChange={e => handleChange("professional", "employeeId", e.target.value)} />
            <Input label="Designation *" value={form.professional.designation} onChange={e => handleChange("professional", "designation", e.target.value)} required />
            <Input label="Department" value={form.professional.department} onChange={e => handleChange("professional", "department", e.target.value)} />
            <Input label="Role" value={form.professional.role} onChange={e => handleChange("professional", "role", e.target.value)} />
            <Input label="Employment Type" value={form.professional.employmentType} onChange={e => handleChange("professional", "employmentType", e.target.value)} />
            <Input label="Joining Date (YYYY-MM-DD)" value={form.professional.joiningDate} onChange={e => handleChange("professional", "joiningDate", e.target.value)} />
            <Input label="Confirmation Date" value={form.professional.confirmationDate} onChange={e => handleChange("professional", "confirmationDate", e.target.value)} />
            <Input label="Experience" value={form.professional.experience} onChange={e => handleChange("professional", "experience", e.target.value)} />
            <Input label="Qualification" value={form.professional.qualification} onChange={e => handleChange("professional", "qualification", e.target.value)} />
          </Section>
        )}

        {/* PAYROLL */}
        {activeTab === "payroll" && (
          <Section title="Payroll Information">
            <Input label="Basic Salary" type="number" value={form.payroll.basicSalary} onChange={e => handleChange("payroll", "basicSalary", parseFloat(e.target.value) || 0)} />
            <Input label="House Rent Allowance" type="number" value={form.payroll.allowances.houseRent} onChange={e => handleNestedChange("payroll", "allowances", "houseRent", parseFloat(e.target.value) || 0)} />
            <Input label="Medical Allowance" type="number" value={form.payroll.allowances.medical} onChange={e => handleNestedChange("payroll", "allowances", "medical", parseFloat(e.target.value) || 0)} />
            <Input label="Transport Allowance" type="number" value={form.payroll.allowances.transport} onChange={e => handleNestedChange("payroll", "allowances", "transport", parseFloat(e.target.value) || 0)} />
            <Input label="Gross Salary" type="number" value={form.payroll.grossSalary} onChange={e => handleChange("payroll", "grossSalary", parseFloat(e.target.value) || 0)} />
            <Input label="Bank Name" value={form.payroll.bankName} onChange={e => handleChange("payroll", "bankName", e.target.value)} />
            <Input label="Account Number" value={form.payroll.accountNumber} onChange={e => handleChange("payroll", "accountNumber", e.target.value)} />
            <Input label="IBAN" value={form.payroll.iban} onChange={e => handleChange("payroll", "iban", e.target.value)} />
            <Input label="Salary Payment Method" value={form.payroll.salaryPaymentMethod} onChange={e => handleChange("payroll", "salaryPaymentMethod", e.target.value)} />
          </Section>
        )}

        {/* ACADEMIC */}
        {activeTab === "academic" && (
          <Section title="Academic Information (Teachers)">
            <ArrayField label="Subjects" items={form.academic.subjects} onChange={(idx, val) => handleArrayChange("academic", "subjects", idx, val)} onAdd={() => handleArrayAdd("academic", "subjects")} />
            <ArrayField label="Classes Assigned" items={form.academic.classesAssigned} onChange={(idx, val) => handleArrayChange("academic", "classesAssigned", idx, val)} onAdd={() => handleArrayAdd("academic", "classesAssigned")} />
            <Input label="Timetable" value={form.academic.timetable} onChange={e => handleChange("academic", "timetable", e.target.value)} />
            <Input label="Section Assignment" value={form.academic.sectionAssignment} onChange={e => handleChange("academic", "sectionAssignment", e.target.value)} />
            <Checkbox label="Class Teacher" checked={form.academic.classTeacher} onChange={e => handleChange("academic", "classTeacher", e.target.checked)} />
          </Section>
        )}

        {/* ATTENDANCE */}
        {activeTab === "attendance" && (
          <Section title="Attendance Integration (Read-only)">
            <Input label="Present Days" type="number" value={form.attendance.presentDays} onChange={e => handleChange("attendance", "presentDays", parseInt(e.target.value) || 0)} />
            <Input label="Absent Days" type="number" value={form.attendance.absentDays} onChange={e => handleChange("attendance", "absentDays", parseInt(e.target.value) || 0)} />
            <Input label="Late Arrivals" type="number" value={form.attendance.lateArrivals} onChange={e => handleChange("attendance", "lateArrivals", parseInt(e.target.value) || 0)} />
            <Input label="Leaves" type="number" value={form.attendance.leaves} onChange={e => handleChange("attendance", "leaves", parseInt(e.target.value) || 0)} />
            <Input label="Attendance %" type="number" value={form.attendance.attendancePercent} onChange={e => handleChange("attendance", "attendancePercent", parseFloat(e.target.value) || 0)} />
          </Section>
        )}

        {/* LEAVES */}
        {activeTab === "leaves" && (
          <Section title="Leave Management">
            <Input label="Casual Leaves" type="number" value={form.leaves.casualLeaves} onChange={e => handleChange("leaves", "casualLeaves", parseInt(e.target.value) || 0)} />
            <Input label="Medical Leaves" type="number" value={form.leaves.medicalLeaves} onChange={e => handleChange("leaves", "medicalLeaves", parseInt(e.target.value) || 0)} />
            <Input label="Annual Leaves" type="number" value={form.leaves.annualLeaves} onChange={e => handleChange("leaves", "annualLeaves", parseInt(e.target.value) || 0)} />
            <Input label="Remaining Leaves" type="number" value={form.leaves.remainingLeaves} onChange={e => handleChange("leaves", "remainingLeaves", parseInt(e.target.value) || 0)} />
          </Section>
        )}

        {/* DOCUMENTS */}
        {activeTab === "documents" && (
          <Section title="Documents (URLs)">
            <Input label="CNIC Front (URL)" value={form.documents.cnicFront} onChange={e => handleChange("documents", "cnicFront", e.target.value)} />
            <Input label="CNIC Back (URL)" value={form.documents.cnicBack} onChange={e => handleChange("documents", "cnicBack", e.target.value)} />
            <ArrayField label="Degree Certificates" items={form.documents.degreeCertificates} onChange={(idx, val) => handleArrayChange("documents", "degreeCertificates", idx, val)} onAdd={() => handleArrayAdd("documents", "degreeCertificates")} />
            <ArrayField label="Experience Certificates" items={form.documents.experienceCertificates} onChange={(idx, val) => handleArrayChange("documents", "experienceCertificates", idx, val)} onAdd={() => handleArrayAdd("documents", "experienceCertificates")} />
            <Input label="Appointment Letter (URL)" value={form.documents.appointmentLetter} onChange={e => handleChange("documents", "appointmentLetter", e.target.value)} />
            <Input label="Contract (URL)" value={form.documents.contract} onChange={e => handleChange("documents", "contract", e.target.value)} />
            <Input label="CV (URL)" value={form.documents.cv} onChange={e => handleChange("documents", "cv", e.target.value)} />
          </Section>
        )}

        {/* EMERGENCY */}
        {activeTab === "emergency" && (
          <Section title="Emergency Contact">
            <Input label="Name" value={form.emergency.name} onChange={e => handleChange("emergency", "name", e.target.value)} />
            <Input label="Relation" value={form.emergency.relation} onChange={e => handleChange("emergency", "relation", e.target.value)} />
            <Input label="Phone" value={form.emergency.phone} onChange={e => handleChange("emergency", "phone", e.target.value)} />
            <Input label="Alternate Phone" value={form.emergency.alternatePhone} onChange={e => handleChange("emergency", "alternatePhone", e.target.value)} />
          </Section>
        )}

        {/* PERFORMANCE */}
        {activeTab === "performance" && (
          <Section title="Performance">
            <Input label="Score" type="number" value={form.performance.score} onChange={e => handleChange("performance", "score", parseFloat(e.target.value) || 0)} />
            <Input label="Principal Remarks" value={form.performance.principalRemarks} onChange={e => handleChange("performance", "principalRemarks", e.target.value)} />
            <Input label="Warnings" type="number" value={form.performance.warnings} onChange={e => handleChange("performance", "warnings", parseInt(e.target.value) || 0)} />
            <ArrayField label="Achievements" items={form.performance.achievements} onChange={(idx, val) => handleArrayChange("performance", "achievements", idx, val)} onAdd={() => handleArrayAdd("performance", "achievements")} />
            <ArrayField label="Promotions" items={form.performance.promotions} onChange={(idx, val) => handleArrayChange("performance", "promotions", idx, val)} onAdd={() => handleArrayAdd("performance", "promotions")} />
            <ArrayField label="Training History" items={form.performance.trainingHistory} onChange={(idx, val) => handleArrayChange("performance", "trainingHistory", idx, val)} onAdd={() => handleArrayAdd("performance", "trainingHistory")} />
          </Section>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => router.back()} className="px-6 py-2 border border-gray-300 rounded-xl font-bold">Cancel</button>
          <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50 flex items-center gap-2">
            {submitting && <Loader2 className="animate-spin" size={18} />}
            Save Staff
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- Helper Components ---------- */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      <h2 className="font-bold text-gray-800 border-b pb-2">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input {...props} className="mt-1 w-full p-2 border border-gray-300 rounded-xl" />
    </div>
  );
}

function Select({ label, options, ...props }: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select {...props} className="mt-1 w-full p-2 border border-gray-300 rounded-xl bg-white">
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

function Checkbox({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <input type="checkbox" {...props} className="h-4 w-4" />
      <label className="text-sm font-medium text-gray-700">{label}</label>
    </div>
  );
}

function ArrayField({ label, items, onChange, onAdd }: { label: string; items: string[]; onChange: (index: number, value: string) => void; onAdd: () => void }) {
  return (
    <div className="col-span-2 space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2">
          <input
            value={item}
            onChange={e => onChange(idx, e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-xl"
          />
        </div>
      ))}
      <button type="button" onClick={onAdd} className="text-sm text-blue-600 font-bold">+ Add {label}</button>
    </div>
  );
}
