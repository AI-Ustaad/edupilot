"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Loader2, AlertTriangle, User, Mail, Phone, MapPin, Calendar,
  Users, BookOpen, CreditCard, Activity, Bus, Home, FileText,
  Heart, Brain, Clock, Award, ClipboardCheck, Wallet, Shield,
} from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import Image from "next/image";

// 🟢 Enterprise SDK
import { useStudentDomain } from "@/hooks/runtime/useStudentDomain";
import { useStudentSync } from "@/hooks/api/useStudentSync";

const TABS = [
  { key: "overview", label: "Overview", icon: User },
  { key: "academic", label: "Academic", icon: BookOpen },
  { key: "attendance", label: "Attendance", icon: ClipboardCheck },
  { key: "fees", label: "Fees", icon: Wallet },
  { key: "behavior", label: "Behavior", icon: Shield },
  { key: "timeline", label: "Timeline", icon: Clock },
  { key: "medical", label: "Medical", icon: Heart },
  { key: "transport", label: "Transport", icon: Bus },
  { key: "parents", label: "Parents", icon: Users },
  { key: "ai", label: "AI Analysis", icon: Brain },
] as const;

export default function Student360Page() {
  const params = useParams();
  const studentId = params?.id as string;
  const [activeTab, setActiveTab] = useState<string>("overview");

  // 1. ⚙️ THE ENGINE: Check background sync
  const { isSyncing } = useStudentSync();

  // 2. 🚰 THE SDK: Instant O(1) Lookup
  const { getStudent } = useStudentDomain();
  const student = getStudent(studentId);

  if (!student && isSyncing) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
        <p className="text-gray-500 font-medium">Hydrating Student Domain...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center p-6 bg-red-50 rounded-2xl border border-red-200 max-w-2xl mx-auto mt-10">
        <AlertTriangle className="text-red-500 w-12 h-12 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Identity Not Found</h2>
        <p className="text-gray-600 mt-2">This student does not exist in the Enterprise Runtime Kernel.</p>
      </div>
    );
  }

  // 🟢 Enterprise Mapping: Map our Strict Entity to the UI
  const fullName = `${student.personal.firstName} ${student.personal.lastName}`;
  const status = student.status.toLowerCase();

  // ⚠️ Mock Data for Relations (To be replaced by Relations Slice in next step)
  const attendance = { present: 45, absent: 5, late: 2, percentage: 88 };
  const fees = { totalDue: 15000, totalPaid: 10000, outstanding: 5000, records: [] };
  const marks = { exams: [], average: 75, trend: "stable" };
  const behavior = { logs: [], incidents: 0 };
  const timeline: any[] = [];

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800 border-green-200",
    graduated: "bg-blue-100 text-blue-800 border-blue-200",
    struckoff: "bg-red-100 text-red-800 border-red-200",
    suspended: "bg-orange-100 text-orange-800 border-orange-200",
    onleave: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };

  return (
    <RequirePermission permissions={[PERMISSIONS.students.view]}>
      <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">

        {/* Header Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              {student.personal.avatarUrl ? (
                <Image src={student.personal.avatarUrl} alt={fullName} width={128} height={128} className="w-28 h-28 rounded-full object-cover border-4 border-blue-50" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-blue-50 flex items-center justify-center border-4 border-blue-100">
                  <span className="text-4xl font-black text-blue-600">{student.personal.firstName.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start flex-wrap">
                <h1 className="text-2xl font-black text-gray-900">{fullName}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[status] || statusColors.active}`}>
                  {student.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 font-medium mt-1">
                ID: {studentId} | Admission: {student.identity.admissionNumber}
              </p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                <span className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold">Class: {student.academic.classId}</span>
                <span className="bg-purple-50 text-purple-600 border border-purple-100 px-3 py-1 rounded-full text-xs font-bold">Section: {student.academic.sectionId}</span>
                <span className="bg-green-50 text-green-600 border border-green-100 px-3 py-1 rounded-full text-xs font-bold">Roll: {student.identity.rollNumber || "N/A"}</span>
                {attendance.percentage < 60 && (
                  <span className="bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <AlertTriangle size={12} /> Low Attendance
                  </span>
                )}
              </div>
            </div>
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                <p className="text-2xl font-black text-green-700">{attendance.percentage}%</p>
                <p className="text-xs text-green-600 font-medium">Attendance</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <p className="text-2xl font-black text-blue-700">{marks.average}%</p>
                <p className="text-xs text-blue-600 font-medium">Avg Marks</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                <p className="text-2xl font-black text-orange-700">Rs {fees.outstanding.toLocaleString()}</p>
                <p className="text-xs text-orange-600 font-medium">Outstanding</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Engine */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-100 px-2 pt-2 gap-1 custom-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-sm font-bold whitespace-nowrap transition ${activeTab === tab.key ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoCard title="Personal Information" icon={<User className="text-blue-600" size={18} />}>
                  <InfoRow label="Date of Birth" value={student.personal.dateOfBirth} />
                  <InfoRow label="Gender" value={student.personal.gender} />
                  <InfoRow label="CNIC / B-Form" value={student.identity.cnicOrBForm} />
                </InfoCard>
                
                <InfoCard title="Emergency Contact" icon={<Phone className="text-green-600" size={18} />}>
                  <InfoRow label="Primary Phone" value={student.parentReferences.emergencyContactPhone} />
                  <InfoRow label="Parent ID" value={student.parentReferences.primaryParentId} />
                </InfoCard>
                
                <InfoCard title="Academic Assignment" icon={<BookOpen className="text-purple-600" size={18} />}>
                  <InfoRow label="Campus ID" value={student.academic.campusId} />
                  <InfoRow label="Admission Date" value={new Date(student.academic.admissionDate).toLocaleDateString()} />
                </InfoCard>
              </div>
            )}

            {/* Other tabs can be placed here similarly. For now, showing placeholders. */}
            {activeTab !== "overview" && (
               <div className="text-center py-12 text-slate-500">
                  <p className="font-medium text-lg">Enterprise {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</p>
                  <p className="text-sm">Connecting to Runtime Relations Slice soon...</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </RequirePermission>
  );
}

// Helper Components
function InfoCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">{icon} {title}</h3>
      <div className="space-y-3 text-sm">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-50 pb-2">
      <span className="text-gray-500 font-medium">{label}</span>
      <span className="text-gray-900 font-bold text-right">{value || "N/A"}</span>
    </div>
  );
}
