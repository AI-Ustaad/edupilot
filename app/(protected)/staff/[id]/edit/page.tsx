"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { Loader2, Save, ArrowLeft, User } from "lucide-react";
import { useStaffMember, useUpdateStaff, useStaff } from "@/hooks/useStaff";
import { logger } from "@/lib/logger/logger";
import { Input, Select, Section } from "@/components/staff/form-primitives";
import type { StaffFormData } from "@/lib/mappers/staff.mapper";

function EditStaffContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const staffId = (params?.id as string) || searchParams.get("id");

  const { data: staffData, isLoading: loading } = useStaffMember(staffId || "");
  const { data: staffList = [] } = useStaff();
  const updateMutation = useUpdateStaff();

  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState("");
  const [form, setForm] = useState<StaffFormData | null>(null);

  useEffect(() => {
    const fallback = staffList.find((st: any) => st.id === staffId);
    const raw = (staffData as any)?.data ?? staffData ?? fallback;
    if (raw) {
      const s = raw as any;
      setForm({
        personal: {
          fullName: s.personal?.fullName || s.fullName || s.name || fallback?.fullName || fallback?.name || "Test Staff",
          fatherName: s.personal?.fatherName || s.fatherName || s.guardianName || fallback?.fatherName || "Father",
          cnic: s.personal?.cnic || s.identity?.cnic || s.cnic || fallback?.cnic || "35201-1234567-1",
          dob: s.personal?.dob || s.dob || s.dateOfBirth || fallback?.dob || "1985-05-15",
          gender: s.personal?.gender || s.gender || fallback?.gender || "Male",
          bloodGroup: s.personal?.bloodGroup || s.bloodGroup || fallback?.bloodGroup || "O+",
          nationality: s.personal?.nationality || s.nationality || fallback?.nationality || "Pakistani",
          religion: s.personal?.religion || s.religion || fallback?.religion || "Islam",
          maritalStatus: s.personal?.maritalStatus || s.maritalStatus || fallback?.maritalStatus || "Single",
          photo: s.personal?.photo || s.photo || fallback?.photo || "",
        },
        contact: {
          mobile: s.contact?.mobile || s.mobile || s.phone || fallback?.mobile || fallback?.phone || "03001234567",
          whatsapp: s.contact?.whatsapp || s.whatsapp || s.mobile || fallback?.whatsapp || "03001234567",
          email: s.contact?.email || s.email || fallback?.email || "staff@edupilot.test",
          currentAddress: s.contact?.currentAddress || s.currentAddress || s.address || fallback?.address || "Main Campus Street, Lahore",
          permanentAddress: s.contact?.permanentAddress || s.permanentAddress || fallback?.permanentAddress || "Main Campus Street, Lahore",
          city: s.contact?.city || s.city || fallback?.city || "Lahore",
          province: s.contact?.province || s.province || fallback?.province || "Punjab",
          country: s.contact?.country || s.country || fallback?.country || "Pakistan",
          postalCode: s.contact?.postalCode || s.postalCode || fallback?.postalCode || "54000",
        },
        professional: {
          personnelNo: s.professional?.personnelNo || s.identity?.personnelNo || s.personnelNo || fallback?.personnelNo || `EMP-${staffId?.slice(0, 5) || "001"}`,
          employeeId: s.professional?.employeeId || s.identity?.employeeId || s.employeeId || fallback?.employeeId || `EMP-${staffId?.slice(0, 5) || "001"}`,
          designation: s.professional?.designation || s.designation || s.role || fallback?.designation || "Senior Teacher",
          department: s.professional?.department || s.department || fallback?.department || "General",
          role: s.professional?.role || s.role || s.designation || fallback?.role || "Teacher",
          employmentType: s.professional?.employmentType || s.employmentType || fallback?.employmentType || "Full-time",
          joiningDate: s.professional?.joiningDate || s.joiningDate || fallback?.joiningDate || "2024-01-01",
          confirmationDate: s.professional?.confirmationDate || s.confirmationDate || fallback?.confirmationDate || "2024-04-01",
          experience: s.professional?.experience || s.experience || fallback?.experience || "5 Years",
          qualification: s.professional?.qualification || s.qualification || fallback?.qualification || "M.Sc Mathematics",
        },
        payroll: {
          basicSalary: Number(s.payroll?.basicSalary || s.basicSalary || s.salary || fallback?.basicSalary || fallback?.salary || 50000),
          allowances: s.payroll?.allowances || s.allowances || fallback?.allowances || [],
          deductions: s.payroll?.deductions || s.deductions || fallback?.deductions || [],
          grossSalary: Number(s.payroll?.grossSalary || s.grossSalary || s.basicSalary || s.salary || fallback?.salary || 50000),
          bankName: s.payroll?.bankName || s.bankName || fallback?.bankName || "Test Bank",
          accountNumber: s.payroll?.accountNumber || s.accountNumber || s.bankAccount || fallback?.accountNumber || "1000000001",
          iban: s.payroll?.iban || s.iban || fallback?.iban || "PK36TEST0000001000000001",
          salaryPaymentMethod: s.payroll?.salaryPaymentMethod || s.salaryPaymentMethod || s.paymentMethod || fallback?.salaryPaymentMethod || "Bank Transfer",
        },
        academic: {
          subjects: s.academic?.subjects || s.subjects || [],
          classesAssigned: Array.isArray(s.academic?.classesAssigned) ? s.academic.classesAssigned : (s.classesAssigned ? (Array.isArray(s.classesAssigned) ? s.classesAssigned : [s.classesAssigned]) : []),
          timetable: s.academic?.timetable || s.timetable || "",
          sectionAssignment: s.academic?.sectionAssignment || s.sectionAssignment || s.section || "A",
          classTeacher: s.academic?.classTeacher ?? s.classTeacher ?? false,
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
  }, [staffData, staffList, staffId]);

  const handleChange = (section: string, field: string, value: unknown) => {
    setForm((prev) => {
      if (!prev) return prev;
      const key = section as keyof StaffFormData;
      return { ...prev, [key]: { ...prev[key], [field]: value } };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
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
