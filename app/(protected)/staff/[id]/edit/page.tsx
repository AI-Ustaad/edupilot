"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Save, ArrowLeft, User } from "lucide-react";
import { useStaffMember, useUpdateStaff } from "@/hooks/useStaff";
import { logger } from "@/lib/logger/logger";

const Input = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label><input {...props} className="w-full p-2 border rounded-xl" /></div>
);
const Select = ({ label, options, ...props }: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label><select {...props} className="w-full p-2 border rounded-xl bg-white">{options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}</select></div>
);
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-2xl border border-gray-200"><h3 className="col-span-2 font-bold text-lg text-gray-800">{title}</h3>{children}</div>
);

function EditStaffContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const staffId = searchParams.get("id");

  const { data: staffData, isLoading: loading } = useStaffMember(staffId || "");
  const updateMutation = useUpdateStaff();

  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState("");
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (staffData) {
      const s = staffData as any;
      setForm({
        personal: {
          fullName: s.personal?.fullName || "",
          fatherName: s.personal?.fatherName || "",
          cnic: s.personal?.cnic || "",
          dob: s.personal?.dob || "",
          gender: s.personal?.gender || "Male",
          bloodGroup: s.personal?.bloodGroup || "",
          nationality: s.personal?.nationality || "",
          religion: s.personal?.religion || "",
          maritalStatus: s.personal?.maritalStatus || "Single",
          photo: s.personal?.photo || "",
        },
        contact: {
          mobile: s.contact?.mobile || "",
          whatsapp: s.contact?.whatsapp || "",
          email: s.contact?.email || "",
          currentAddress: s.contact?.currentAddress || "",
          permanentAddress: s.contact?.permanentAddress || "",
          city: s.contact?.city || "",
          province: s.contact?.province || "",
          country: s.contact?.country || "",
          postalCode: s.contact?.postalCode || "",
        },
        professional: {
          personnelNo: s.professional?.personnelNo || "",
          employeeId: s.professional?.employeeId || "",
          designation: s.professional?.designation || "",
          department: s.professional?.department || "",
          role: s.professional?.role || "",
          employmentType: s.professional?.employmentType || "",
          joiningDate: s.professional?.joiningDate || "",
          confirmationDate: s.professional?.confirmationDate || "",
          experience: s.professional?.experience || "",
          qualification: s.professional?.qualification || "",
        },
        payroll: {
          basicSalary: s.payroll?.basicSalary || 0,
          allowances: s.payroll?.allowances || [],
          deductions: s.payroll?.deductions || [],
          grossSalary: s.payroll?.grossSalary || 0,
          bankName: s.payroll?.bankName || "",
          accountNumber: s.payroll?.accountNumber || "",
          iban: s.payroll?.iban || "",
          salaryPaymentMethod: s.payroll?.salaryPaymentMethod || "",
        },
        academic: {
          subjects: s.academic?.subjects || [],
          classesAssigned: s.academic?.classesAssigned || [],
          timetable: s.academic?.timetable || "",
          sectionAssignment: s.academic?.sectionAssignment || "",
          classTeacher: s.academic?.classTeacher || false,
        },
        emergency: {
          name: s.emergency?.name || "",
          relation: s.emergency?.relation || "",
          phone: s.emergency?.phone || "",
          alternatePhone: s.emergency?.alternatePhone || "",
        },
        documents: {
          cnicFront: s.documents?.cnicFront || "",
          cnicBack: s.documents?.cnicBack || "",
          degree: s.documents?.degree || "",
          experienceCert: s.documents?.experienceCert || "",
          cv: s.documents?.cv || "",
        },
      });
    }
  }, [staffData]);

  const handleChange = (section: string, field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    setError("");
    logger.info("[EditStaff] Submitting payload", { metadata: { staffId, payroll: form.payroll } });
    updateMutation.mutate(
      { id: staffId!, data: form },
      { onSuccess: () => router.push(`/staff-profile?id=${staffId}`) }
    );
  };

  if (loading || !form) {
    return <div className="flex h-[80vh] items-center justify-center font-bold text-slate-400">Loading Staff Data...</div>;
  }

  const tabs = ["Basic Info", "Professional", "Financial", "Emergency", "Documents"];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700"><ArrowLeft size={24} /></button>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <User className="text-blue-600" /> Edit Staff Member
          </h1>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl font-bold">{error}</div>}

      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab, idx) => (
          <button key={idx} onClick={() => setActiveTab(idx)} className={`flex-1 py-2 font-bold text-sm uppercase tracking-wider rounded-t-lg transition ${activeTab === idx ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {tab}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === 0 && (
          <Section title="Personal Information">
            <Input label="Full Name *" value={form.personal.fullName} onChange={e => handleChange("personal", "fullName", e.target.value)} required />
            <Input label="Father Name" value={form.personal.fatherName} onChange={e => handleChange("personal", "fatherName", e.target.value)} />
            <Input label="CNIC" value={form.personal.cnic} onChange={e => handleChange("personal", "cnic", e.target.value)} />
            <Input label="Date of Birth" type="date" value={form.personal.dob} onChange={e => handleChange("personal", "dob", e.target.value)} />
            <Select label="Gender" value={form.personal.gender} onChange={e => handleChange("personal", "gender", e.target.value)} options={["Male", "Female", "Other"]} />
            <Input label="Mobile" value={form.contact.mobile} onChange={e => handleChange("contact", "mobile", e.target.value)} />
            <Input label="Email" value={form.contact.email} onChange={e => handleChange("contact", "email", e.target.value)} />
            <Input label="Blood Group" value={form.personal.bloodGroup} onChange={e => handleChange("personal", "bloodGroup", e.target.value)} />
          </Section>
        )}

        {activeTab === 1 && (
          <Section title="Professional Information">
            <Input label="Personnel No *" value={form.professional.personnelNo} onChange={e => handleChange("professional", "personnelNo", e.target.value)} required />
            <Input label="Employee ID" value={form.professional.employeeId} onChange={e => handleChange("professional", "employeeId", e.target.value)} />
            <Input label="Designation *" value={form.professional.designation} onChange={e => handleChange("professional", "designation", e.target.value)} required />
            <Input label="Department" value={form.professional.department} onChange={e => handleChange("professional", "department", e.target.value)} />
            <Select label="Employment Type" value={form.professional.employmentType} onChange={e => handleChange("professional", "employmentType", e.target.value)} options={["", "Permanent", "Contract", "Temporary"]} />
            <Input label="Joining Date" type="date" value={form.professional.joiningDate} onChange={e => handleChange("professional", "joiningDate", e.target.value)} />
            <Input label="Qualification" value={form.professional.qualification} onChange={e => handleChange("professional", "qualification", e.target.value)} />
            <Input label="Experience" value={form.professional.experience} onChange={e => handleChange("professional", "experience", e.target.value)} />
          </Section>
        )}

        {activeTab === 2 && (
          <Section title="Payroll & Financial">
            <Input label="Basic Salary" type="number" value={form.payroll.basicSalary} onChange={e => handleChange("payroll", "basicSalary", parseFloat(e.target.value) || 0)} />
            <Input label="Gross Salary" type="number" value={form.payroll.grossSalary} onChange={e => handleChange("payroll", "grossSalary", parseFloat(e.target.value) || 0)} />
            <Input label="Bank Name" value={form.payroll.bankName} onChange={e => handleChange("payroll", "bankName", e.target.value)} />
            <Input label="Account Number" value={form.payroll.accountNumber} onChange={e => handleChange("payroll", "accountNumber", e.target.value)} />
            <Input label="IBAN" value={form.payroll.iban} onChange={e => handleChange("payroll", "iban", e.target.value)} />
            <Select label="Payment Method" value={form.payroll.salaryPaymentMethod} onChange={e => handleChange("payroll", "salaryPaymentMethod", e.target.value)} options={["", "Bank Transfer", "Cash", "Cheque"]} />
          </Section>
        )}

        {activeTab === 3 && (
          <Section title="Emergency Contact">
            <Input label="Contact Name" value={form.emergency.name} onChange={e => handleChange("emergency", "name", e.target.value)} />
            <Input label="Relationship" value={form.emergency.relation} onChange={e => handleChange("emergency", "relation", e.target.value)} />
            <Input label="Phone" value={form.emergency.phone} onChange={e => handleChange("emergency", "phone", e.target.value)} />
            <Input label="Alternate Phone" value={form.emergency.alternatePhone} onChange={e => handleChange("emergency", "alternatePhone", e.target.value)} />
          </Section>
        )}

        {activeTab === 4 && (
          <Section title="Documents (URLs)">
            <Input label="CNIC Front URL" value={form.documents.cnicFront} onChange={e => handleChange("documents", "cnicFront", e.target.value)} />
            <Input label="CNIC Back URL" value={form.documents.cnicBack} onChange={e => handleChange("documents", "cnicBack", e.target.value)} />
            <Input label="Degree URL" value={form.documents.degree} onChange={e => handleChange("documents", "degree", e.target.value)} />
            <Input label="Experience Cert URL" value={form.documents.experienceCert} onChange={e => handleChange("documents", "experienceCert", e.target.value)} />
            <Input label="CV URL" value={form.documents.cv} onChange={e => handleChange("documents", "cv", e.target.value)} />
          </Section>
        )}

        <div className="mt-6 flex gap-4">
          {activeTab > 0 && (
            <button type="button" onClick={() => setActiveTab(activeTab - 1)} className="w-full bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold">Back</button>
          )}
          {activeTab < 4 ? (
            <button type="button" onClick={() => setActiveTab(activeTab + 1)} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold">Next</button>
          ) : (
            <button type="submit" disabled={updateMutation.isPending} className="w-full bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50">
              {updateMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Update Staff Record
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default function EditStaffPage() {
  return (
    <Suspense fallback={<div className="p-10 font-bold text-center text-slate-500">Loading...</div>}>
      <EditStaffContent />
    </Suspense>
  );
}
