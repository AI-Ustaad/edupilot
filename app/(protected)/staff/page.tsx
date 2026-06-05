"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Camera, Upload, Plus, Trash2, Calculator, FileSpreadsheet, FileText } from "lucide-react";

// -------------------- Main Component --------------------
export default function AddStaffPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEdit = Boolean(editId);

  const [activeTab, setActiveTab] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Staff directory (right sidebar)
  const [staffList, setStaffList] = useState<any[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(true);

  // Form state – same structure as Zod schema expects
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
    emergency: { name: "", relation: "", phone: "", alternatePhone: "" },
    performance: {
      score: 0, principalRemarks: "", warnings: 0,
      achievements: [] as string[],
      promotions: [] as string[],
      trainingHistory: [] as string[],
    },
  });

  const [createLogin, setCreateLogin] = useState(false);

  // -------------------- Fetch existing staff for edit --------------------
  useEffect(() => {
    if (editId) {
      fetch(`/api/staff/${editId}`)
        .then(res => res.json())
        .then(json => {
          const data = json.data || json;
          if (data) {
            // Merge with default values so missing fields are filled
            setForm((prev: any) => deepMerge(prev, data));
          }
        })
        .catch(console.error);
    }
  }, [editId]);

  // -------------------- Fetch staff directory --------------------
  useEffect(() => {
    fetch("/api/staff")
      .then(res => res.json())
      .then(json => {
        const staffData = json.data?.data || json.data || json;
        setStaffList(Array.isArray(staffData) ? staffData : []);
      })
      .catch(console.error)
      .finally(() => setDirectoryLoading(false));
  }, []);

  // -------------------- Handlers --------------------
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

  const handleArrayChange = (section: string, field: string, index: number, value: any) => {
    const newArr = [...form[section][field]];
    newArr[index] = value;
    setForm((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], [field]: newArr },
    }));
  };

  const handleAddArray = (section: string, field: string, defaultValue: any = "") => {
    setForm((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], [field]: [...prev[section][field], defaultValue] },
    }));
  };

  const handleRemoveArray = (section: string, field: string, index: number) => {
    const newArr = form[section][field].filter((_: any, i: number) => i !== index);
    setForm((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], [field]: newArr },
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange("personal", "photo", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Live Net Pay Calculation
  const calcNetPay = () => {
    const basic = form.payroll.basicSalary || 0;
    const allowances = form.payroll.allowances.reduce((sum: number, a: any) => sum + (a.amount || 0), 0);
    const deductions = form.payroll.deductions.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
    return basic + allowances - deductions;
  };

  // -------------------- Auto‑login Account Creation --------------------
  const createUserAccount = async (staff: any) => {
    if (!createLogin) return;
    try {
      const email = staff.personal?.email || `${staff.professional?.personnelNo}@school`;
      const password = staff.personal?.cnic || "12345678"; // default
      await fetch("/api/auth/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: staff.professional?.role || "teacher", tenantId: staff.tenantId }),
      });
    } catch (err) {
      console.error("Auto login creation failed", err);
    }
  };

  // -------------------- Submit --------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const payload = { ...form };
    if (isEdit) payload.id = editId; // not used by POST, but PUT requires ID

    try {
      const url = isEdit ? `/api/staff/${editId}` : "/api/staff";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (res.ok) {
        setSuccess(isEdit ? "Staff updated successfully!" : "Staff added successfully!");
        if (!isEdit) {
          await createUserAccount(json.data || payload);
        }
        // Refresh directory
        const dirRes = await fetch("/api/staff");
        const dirJson = await dirRes.json();
        const dirData = dirJson.data?.data || dirJson.data || dirJson;
        setStaffList(Array.isArray(dirData) ? dirData : []);
      } else {
        setError(json.message || json.error || "Failed to save staff");
      }
    } catch (err) {
      setError("Network error – please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { label: "Basic Info", icon: "👤" },
    { label: "Professional", icon: "💼" },
    { label: "Education", icon: "🎓" },
    { label: "Financial", icon: "💰" },
  ];

  return (
    <div className="flex h-full">
      {/* ---------- Main Form ---------- */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-black text-gray-900 mb-4">
          {isEdit ? "Update Staff" : "Staff Onboarding"}
        </h1>

        {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl font-bold mb-4">{error}</div>}
        {success && <div className="bg-green-50 text-green-700 p-3 rounded-xl font-bold mb-4">{success}</div>}

        {/* Tabs */}
        <div className="flex mb-6 gap-1">
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

        {/* Tab Content */}
        <form onSubmit={handleSubmit}>
          {/* BASIC INFO */}
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
                <div>
                  <Input label="Full Name *" value={form.personal.fullName} onChange={e => handleChange("personal", "fullName", e.target.value)} required />
                </div>
              </div>
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

          {/* PROFESSIONAL */}
          {activeTab === 1 && (
            <Section title="Professional Information">
              <Input label="Personnel No *" value={form.professional.personnelNo} onChange={e => handleChange("professional", "personnelNo", e.target.value)} required />
              <Input label="Employee ID" value={form.professional.employeeId} onChange={e => handleChange("professional", "employeeId", e.target.value)} />
              <Input label="Designation *" value={form.professional.designation} onChange={e => handleChange("professional", "designation", e.target.value)} required />
              <Input label="Department" value={form.professional.department} onChange={e => handleChange("professional", "department", e.target.value)} />
              <Input label="Role" value={form.professional.role} onChange={e => handleChange("professional", "role", e.target.value)} />
              <Input label="Employment Type" value={form.professional.employmentType} onChange={e => handleChange("professional", "employmentType", e.target.value)} />
              <Input label="Joining Date (YYYY-MM-DD)" value={form.professional.joiningDate} onChange={e => handleChange("professional", "joiningDate", e.target.value)} />
              <Input label="Confirmation Date" value={form.professional.confirmationDate} onChange={e => handleChange("professional", "confirmationDate", e.target.value)} />
              <Input label="Experience (years)" value={form.professional.experience} onChange={e => handleChange("professional", "experience", e.target.value)} />
              <Input label="Qualification" value={form.professional.qualification} onChange={e => handleChange("professional", "qualification", e.target.value)} />
            </Section>
          )}

          {/* EDUCATION */}
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
                    <Input label="Level (e.g. Matric, BS)" value={edu.level} onChange={e => { const arr = [...form.education]; arr[idx].level = e.target.value; setForm((prev: any) => ({ ...prev, education: arr })); }} />
                    <Input label="Institute" value={edu.institute} onChange={e => { const arr = [...form.education]; arr[idx].institute = e.target.value; setForm((prev: any) => ({ ...prev, education: arr })); }} />
                    <Input label="Passing Year" value={edu.passingYear} onChange={e => { const arr = [...form.education]; arr[idx].passingYear = e.target.value; setForm((prev: any) => ({ ...prev, education: arr })); }} />
                    <Input label="Subjects" value={edu.subjects} onChange={e => { const arr = [...form.education]; arr[idx].subjects = e.target.value; setForm((prev: any) => ({ ...prev, education: arr })); }} />
                    <Input label="Document URL (optional)" value={edu.document || ""} onChange={e => { const arr = [...form.education]; arr[idx].document = e.target.value; setForm((prev: any) => ({ ...prev, education: arr })); }} />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setForm((prev: any) => ({ ...prev, education: [...prev.education, { level: "", institute: "", passingYear: "", subjects: "", document: "" }] }))}
                className="col-span-2 text-blue-600 font-bold flex items-center gap-1"
              >
                <Plus size={16} /> Add Education
              </button>
            </Section>
          )}

          {/* FINANCIAL */}
          {activeTab === 3 && (
            <Section title="Payroll & Financial">
              <Input label="Basic Salary" type="number" value={form.payroll.basicSalary} onChange={e => handleChange("payroll", "basicSalary", parseFloat(e.target.value) || 0)} />
              {/* Allowances */}
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
                      onChange={e => { const arr = [...form.payroll.allowances]; arr[idx].amount = parseFloat(e.target.value) || 0; setForm((prev: any) => ({ ...prev, payroll: { ...prev.payroll, allowances: arr } })); }}
                      className="w-24 p-2 border rounded-xl"
                    />
                    <button type="button" onClick={() => { const arr = form.payroll.allowances.filter((_: any, i: number) => i !== idx); setForm((prev: any) => ({ ...prev, payroll: { ...prev.payroll, allowances: arr } })); }} className="text-red-500"><Trash2 size={16} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setForm((prev: any) => ({ ...prev, payroll: { ...prev.payroll, allowances: [...prev.payroll.allowances, { name: "", amount: 0 }] } }))} className="text-blue-600 font-bold text-sm">+ Add Allowance</button>
              </div>

              {/* Deductions */}
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
                      onChange={e => { const arr = [...form.payroll.deductions]; arr[idx].amount = parseFloat(e.target.value) || 0; setForm((prev: any) => ({ ...prev, payroll: { ...prev.payroll, deductions: arr } })); }}
                      className="w-24 p-2 border rounded-xl"
                    />
                    <button type="button" onClick={() => { const arr = form.payroll.deductions.filter((_: any, i: number) => i !== idx); setForm((prev: any) => ({ ...prev, payroll: { ...prev.payroll, deductions: arr } })); }} className="text-red-500"><Trash2 size={16} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setForm((prev: any) => ({ ...prev, payroll: { ...prev.payroll, deductions: [...prev.payroll.deductions, { name: "", amount: 0 }] } }))} className="text-blue-600 font-bold text-sm">+ Add Deduction</button>
              </div>

              <div className="col-span-2 bg-gray-900 text-white p-4 rounded-xl flex justify-between items-center">
                <span className="font-black text-lg">Net Pay (Live)</span>
                <span className="text-2xl font-black text-green-400">Rs. {calcNetPay().toLocaleString()}</span>
              </div>
              <Input label="Bank Name" value={form.payroll.bankName} onChange={e => handleChange("payroll", "bankName", e.target.value)} />
              <Input label="Account Number" value={form.payroll.accountNumber} onChange={e => handleChange("payroll", "accountNumber", e.target.value)} />
              <Input label="IBAN" value={form.payroll.iban} onChange={e => handleChange("payroll", "iban", e.target.value)} />
              <Input label="Salary Payment Method" value={form.payroll.salaryPaymentMethod} onChange={e => handleChange("payroll", "salaryPaymentMethod", e.target.value)} />
            </Section>
          )}

          {/* Common bottom buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <label className="flex items-center gap-2 font-bold text-sm">
              <input type="checkbox" checked={createLogin} onChange={e => setCreateLogin(e.target.checked)} />
              Auto‑create Login Account (email = personnelNo@school, password = CNIC)
            </label>
            <button type="submit" disabled={submitting} className="ml-auto bg-blue-600 text-white px-6 py-2 rounded-xl font-bold disabled:opacity-50 flex items-center gap-2">
              {submitting && <Loader2 className="animate-spin" size={18} />}
              {isEdit ? "Update Staff" : "Save Record"}
            </button>
            {isEdit && (
              <button type="button" onClick={() => router.push("/staff/add")} className="px-4 py-2 border rounded-xl font-bold">
                Cancel Edit
              </button>
            )}
            <button type="button" onClick={() => setShowBulkModal(true)} className="ml-2 bg-green-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2">
              <FileSpreadsheet size={18} /> Bulk Import
            </button>
            <button type="button" onClick={() => alert("OCR feature coming soon")} className="ml-2 bg-purple-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2">
              <FileText size={18} /> OCR Extract
            </button>
          </div>
        </form>
      </div>

      {/* ---------- Live Staff Directory (Right Sidebar) ---------- */}
      <div className="hidden lg:block w-72 border-l border-gray-200 bg-white overflow-y-auto p-4">
        <h2 className="font-black text-gray-900 text-lg mb-4">Staff Directory</h2>
        {directoryLoading ? (
          <Loader2 className="animate-spin mx-auto" />
        ) : staffList.length === 0 ? (
          <p className="text-sm text-gray-500">No staff yet</p>
        ) : (
          <div className="space-y-3">
            {staffList.map((staff: any) => (
              <div
                key={staff.id}
                className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100"
                onClick={() => router.push(`/staff/add?id=${staff.id}`)}
              >
                {staff.personal?.photo ? (
                  <img src={staff.personal.photo} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs font-bold">{staff.personal?.fullName?.[0]}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{staff.personal?.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{staff.professional?.designation}</p>
                  <p className="text-xs text-gray-400">{staff.professional?.personnelNo}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Import Modal (reuse from list page if needed) */}
      {showBulkModal && (
        <BulkImportModal onClose={() => setShowBulkModal(false)} onSuccess={() => {
          // refresh directory
          fetch("/api/staff")
            .then(res => res.json())
            .then(json => setStaffList(json.data?.data || json.data || []));
          setShowBulkModal(false);
        }} />
      )}
    </div>
  );
}

// -------------------- Helper Components --------------------
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 mb-6">
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

function BulkImportModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  // You can copy the bulk import logic from the staff list page
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Bulk Import Staff</h2>
        <p className="text-sm text-gray-500 mb-4">
          Upload an Excel file (.xlsx, .xls) with columns: Full Name, Email, Phone, Designation, Personnel No.
        </p>
        <input
          type="file"
          accept=".xlsx,.xls"
          className="mb-4"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const XLSX = await import("xlsx");
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet);
            // map to staff members and post to /api/staff/bulk
            try {
              const staffMembers = rows.map((row: any) => ({
                personal: { fullName: row["Full Name"] || row.fullName, email: row.Email || row.email, phone: row.Phone || row.phone },
                professional: { designation: row.Designation || row.designation, personnelNo: row["Personnel No"] || row.personnelNo },
              }));
              const res = await fetch("/api/staff/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ staffMembers }),
              });
              if (res.ok) {
                alert("Import successful");
                onSuccess();
              } else {
                const err = await res.json();
                alert(err.message || "Import failed");
              }
            } catch (err) {
              alert("Error processing file");
            }
          }}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// Simple deep merge (for edit mode)
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}
