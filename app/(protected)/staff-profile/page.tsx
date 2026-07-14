/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
"use client";
import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Users, Building2, Wallet, GraduationCap, Briefcase,
  ArrowLeft, Printer, MapPin, Phone, Mail, Calendar,
  FileText, ShieldCheck, Heart, BookOpen, Award, AlertTriangle,
  Clock, MessageSquare, Sparkles, Activity, UserCheck, BookOpenCheck,
} from "lucide-react";
import { useStaffMember, useStaffTimeline } from "@/hooks/useStaff";
import type { Staff } from "@/types/staff";

function StaffProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const staffId = searchParams.get("id");
  const { data: staffData, isLoading } = useStaffMember(staffId || "");
  const { data: timelineData } = useStaffTimeline(staffId || "");
  const [activeTab, setActiveTab] = useState("overview");
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  if (isLoading) {
    return <div className="flex h-[80vh] items-center justify-center font-bold text-slate-400">Loading Staff Profile...</div>;
  }
  if (!staffData) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
        <Users size={64} className="text-slate-300" />
        <h2 className="text-2xl font-black text-slate-700">Profile Not Found</h2>
        <button onClick={() => router.back()} className="bg-[#0F172A] text-white px-6 py-2 rounded-xl font-bold">Go Back</button>
      </div>
    );
  }

  const staff = staffData as Staff;
  const { personal, contact, professional, payroll, academic, emergency, documents, performance, attendance, leaves, status, category, campus, statusHistory } = staff;

  const TABS = [
    { id: "overview", label: "Overview", icon: Users },
    { id: "employment", label: "Employment", icon: Briefcase },
    { id: "qualification", label: "Qualification", icon: GraduationCap },
    { id: "experience", label: "Experience", icon: Activity },
    { id: "subjects", label: "Subjects", icon: BookOpen },
    { id: "classes", label: "Classes", icon: BookOpenCheck },
    { id: "attendance", label: "Attendance", icon: Clock },
    { id: "leave", label: "Leave", icon: Calendar },
    { id: "payroll", label: "Payroll", icon: Wallet },
    { id: "performance", label: "Performance", icon: Award },
    { id: "timeline", label: "Timeline", icon: Activity },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "ai", label: "AI Summary", icon: Sparkles },
    { id: "communication", label: "Comms", icon: MessageSquare },
  ];

  const calcNetSalary = () => {
    const basic = payroll?.basicSalary || 0;
    const allowances = (payroll?.allowances || []).reduce((s, a) => s + (a.amount || 0), 0);
    const deductions = (payroll?.deductions || []).reduce((s, d) => s + (d.amount || 0), 0);
    return basic + allowances - deductions;
  };

  const fetchAISummary = async () => {
    if (aiSummary) return;
    setAiLoading(true);
    try {
      const res = await fetch(`/api/v1/staff/${staffId}/ai`);
      const json = await res.json();
      setAiSummary(json.data?.summary || "AI summary unavailable.");
    } catch { setAiSummary("Failed to generate AI summary."); }
    finally { setAiLoading(false); }
  };

  const STATUS_COLORS: Record<string, string> = {
    active: "bg-green-50 text-green-700 border-green-200",
    terminated: "bg-red-50 text-red-700 border-red-200",
    resigned: "bg-gray-50 text-gray-600 border-gray-200",
    suspended: "bg-yellow-50 text-yellow-700 border-yellow-200",
    "on-leave": "bg-blue-50 text-blue-700 border-blue-200",
    archived: "bg-orange-50 text-orange-700 border-orange-200",
  };

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      {/* Header Controls */}
      <div className="flex justify-between items-center print:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-[#0F172A] font-bold transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          <ArrowLeft size={18} /> Back
        </button>
        <div className="flex gap-2">
          <button onClick={() => router.push(`/staff/${staffId}/edit`)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md">
            Edit Profile
          </button>
          <button onClick={() => window.print()} className="bg-[#3ac47d] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#2eaa6a] transition-all shadow-md">
            <Printer size={18} /> Print
          </button>
        </div>
      </div>

      {/* Profile Banner */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="h-32 bg-[#3ac47d] w-full"></div>
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16 mb-4">
            <div className="w-32 h-32 bg-white rounded-2xl border-4 border-white shadow-lg overflow-hidden shrink-0 flex items-center justify-center">
              {personal?.photo ? <img src={personal.photo} alt="Profile" className="w-full h-full object-cover" /> : <Users size={40} className="text-slate-300" />}
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-black text-[#0F172A] uppercase">{personal?.fullName || "N/A"}</h1>
              <p className="text-sm font-bold text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                <span className="text-[#3ac47d] flex items-center gap-1"><ShieldCheck size={16} /> {professional?.designation || "No Designation"}</span>
                {professional?.department && <span>• {professional.department}</span>}
                {category && <span>• {category}</span>}
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${STATUS_COLORS[status || "active"]}`}>
                  {status || "active"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-100 bg-slate-50/50">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); if (tab.id === "ai") fetchAISummary(); }}
              className={`flex-1 py-3 px-2 font-bold text-xs flex items-center justify-center gap-1 transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id ? "border-[#3ac47d] text-[#3ac47d] bg-white" : "border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800"}`}>
              <tab.icon size={13} /> <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-8 min-h-[400px]">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="animate-fade-in-down grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-black text-slate-800 text-lg">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Father Name</p><p className="font-bold text-slate-800">{personal?.fatherName || "N/A"}</p></div>
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CNIC</p><p className="font-bold text-slate-800">{personal?.cnic || "N/A"}</p></div>
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DOB</p><p className="font-bold text-slate-800">{personal?.dob || "N/A"}</p></div>
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gender</p><p className="font-bold text-slate-800">{personal?.gender || "N/A"}</p></div>
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Blood Group</p><p className="font-bold text-slate-800">{personal?.bloodGroup || "N/A"}</p></div>
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Marital Status</p><p className="font-bold text-slate-800">{personal?.maritalStatus || "N/A"}</p></div>
                </div>
              </div>
              <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h3 className="font-black text-slate-800 text-lg">Contact & Address</h3>
                <p className="font-bold text-slate-800 flex items-center gap-2"><Phone size={14} className="text-[#3ac47d]" /> {contact?.mobile || "N/A"}</p>
                <p className="font-bold text-slate-800 flex items-center gap-2"><Mail size={14} className="text-blue-500" /> {contact?.email || "N/A"}</p>
                <p className="font-bold text-slate-800 flex items-start gap-2"><MapPin size={14} className="text-red-400 shrink-0 mt-1" /> {contact?.currentAddress || "N/A"}</p>
                <p className="font-bold text-slate-800">{contact?.city || ""} {contact?.province ? `, ${contact.province}` : ""} {contact?.country || ""}</p>
              </div>
            </div>
          )}

          {/* TAB 2: EMPLOYMENT */}
          {activeTab === "employment" && (
            <div className="animate-fade-in-down space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "Personnel No", value: professional?.personnelNo },
                  { label: "Employee ID", value: professional?.employeeId },
                  { label: "Designation", value: professional?.designation, highlight: true },
                  { label: "Department", value: professional?.department },
                  { label: "Role", value: professional?.role },
                  { label: "Employment Type", value: professional?.employmentType },
                  { label: "Joining Date", value: professional?.joiningDate },
                  { label: "Confirmation Date", value: professional?.confirmationDate },
                  { label: "Campus", value: campus },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className={`font-bold text-lg ${item.highlight ? "text-[#3ac47d]" : "text-slate-800"}`}>{item.value || "N/A"}</p>
                  </div>
                ))}
              </div>
              {statusHistory && statusHistory.length > 0 && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Status History</p>
                  <div className="space-y-2">
                    {statusHistory.map((sh, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <span className="text-slate-400 text-xs">{sh.changedAt}</span>
                        <span className="font-bold text-slate-700">{sh.fromStatus} → {sh.toStatus}</span>
                        {sh.reason && <span className="text-slate-500">({sh.reason})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: QUALIFICATION */}
          {activeTab === "qualification" && (
            <div className="animate-fade-in-down space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Highest Qualification</p>
                <p className="font-bold text-slate-800 text-lg">{professional?.qualification || "Not specified"}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Degree Certificates</p>
                {(documents?.degreeCertificates || []).length > 0 ? (
                  <div className="space-y-2">{documents!.degreeCertificates!.map((d, i) => (
                    <a key={i} href={d} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-bold block">Certificate {i + 1}</a>
                  ))}</div>
                ) : <p className="text-slate-400 text-sm font-bold">No certificates uploaded</p>}
              </div>
            </div>
          )}

          {/* TAB 4: EXPERIENCE */}
          {activeTab === "experience" && (
            <div className="animate-fade-in-down space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Experience Summary</p>
                <p className="font-bold text-slate-800">{professional?.experience || "Not specified"}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Experience Certificates</p>
                {(documents?.experienceCertificates || []).length > 0 ? (
                  <div className="space-y-2">{documents!.experienceCertificates!.map((d, i) => (
                    <a key={i} href={d} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-bold block">Certificate {i + 1}</a>
                  ))}</div>
                ) : <p className="text-slate-400 text-sm font-bold">No certificates uploaded</p>}
              </div>
              {(performance?.trainingHistory || []).length > 0 && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Training History</p>
                  <ul className="list-disc list-inside space-y-1">{performance!.trainingHistory!.map((t, i) => <li key={i} className="font-bold text-slate-700">{t}</li>)}</ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SUBJECTS */}
          {activeTab === "subjects" && (
            <div className="animate-fade-in-down">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Assigned Subjects</p>
                <div className="flex flex-wrap gap-2">
                  {(academic?.subjects || []).length > 0 ? academic!.subjects!.map((s, i) => (
                    <span key={i} className="bg-blue-50 text-blue-700 border border-blue-100 px-4 py-2 rounded-full text-sm font-bold">{s}</span>
                  )) : <p className="text-slate-400 font-bold text-sm">No subjects assigned</p>}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CLASSES */}
          {activeTab === "classes" && (
            <div className="animate-fade-in-down space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Class Teacher</p>
                  <p className="font-bold text-slate-800 text-lg">{academic?.classTeacher ? "Yes" : "No"}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Section</p>
                  <p className="font-bold text-slate-800 text-lg">{academic?.sectionAssignment || "N/A"}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Assigned Classes</p>
                <div className="flex flex-wrap gap-2">
                  {(academic?.classesAssigned || []).length > 0 ? academic!.classesAssigned!.map((c, i) => (
                    <span key={i} className="bg-green-50 text-green-700 border border-green-100 px-4 py-2 rounded-full text-sm font-bold">{c}</span>
                  )) : <p className="text-slate-400 font-bold text-sm">No classes assigned</p>}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: ATTENDANCE */}
          {activeTab === "attendance" && (
            <div className="animate-fade-in-down">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { label: "Present Days", value: attendance?.presentDays || 0, color: "text-green-600" },
                  { label: "Absent Days", value: attendance?.absentDays || 0, color: "text-red-500" },
                  { label: "Late Arrivals", value: attendance?.lateArrivals || 0, color: "text-yellow-600" },
                  { label: "Leaves Taken", value: attendance?.leaves || 0, color: "text-blue-600" },
                  { label: "Attendance %", value: `${attendance?.attendancePercent || 0}%`, color: "text-[#3ac47d]" },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className={`font-bold text-2xl ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: LEAVE */}
          {activeTab === "leave" && (
            <div className="animate-fade-in-down">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Casual Leaves", value: leaves?.casualLeaves || 0 },
                  { label: "Medical Leaves", value: leaves?.medicalLeaves || 0 },
                  { label: "Annual Leaves", value: leaves?.annualLeaves || 0 },
                  { label: "Remaining", value: leaves?.remainingLeaves || 0 },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="font-bold text-2xl text-[#3ac47d]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: PAYROLL */}
          {activeTab === "payroll" && (
            <div className="animate-fade-in-down space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <div className="bg-blue-50 px-4 py-3 border-b border-blue-100"><h4 className="font-black text-blue-800 uppercase tracking-widest text-xs">Pay & Allowances</h4></div>
                  <div className="divide-y divide-slate-100 bg-white">
                    {payroll?.basicSalary ? <div className="px-4 py-2 flex justify-between"><span className="text-sm font-bold text-slate-600">Basic Salary</span><span className="text-sm font-black">Rs. {payroll.basicSalary.toLocaleString()}</span></div> : null}
                    {(payroll?.allowances || []).length > 0 ? payroll!.allowances!.map((a, i) => (
                      <div key={i} className="px-4 py-2 flex justify-between"><span className="text-sm font-bold text-slate-600">{a.name}</span><span className="text-sm font-black">Rs. {(a.amount || 0).toLocaleString()}</span></div>
                    )) : <div className="p-4 text-center text-sm text-slate-400 font-bold">No Allowances</div>}
                  </div>
                </div>
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <div className="bg-red-50 px-4 py-3 border-b border-red-100"><h4 className="font-black text-red-800 uppercase tracking-widest text-xs">Deductions</h4></div>
                  <div className="divide-y divide-slate-100 bg-white">
                    {(payroll?.deductions || []).length > 0 ? payroll!.deductions!.map((d, i) => (
                      <div key={i} className="px-4 py-2 flex justify-between"><span className="text-sm font-bold text-slate-600">{d.name}</span><span className="text-sm font-black text-red-500">- Rs. {(d.amount || 0).toLocaleString()}</span></div>
                    )) : <div className="p-4 text-center text-sm text-slate-400 font-bold">No Deductions</div>}
                  </div>
                </div>
              </div>
              <div className="bg-[#0F172A] rounded-3xl p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Bank Account</p>
                  <p className="font-bold text-lg">{payroll?.bankName || "No Bank"}</p>
                  <p className="text-sm text-slate-300 mt-1">A/C: {payroll?.accountNumber || "N/A"} {payroll?.iban ? `• IBAN: ${payroll.iban}` : ""}</p>
                  <p className="text-xs text-slate-400 mt-1">Method: {payroll?.salaryPaymentMethod || "N/A"}</p>
                </div>
                <div className="text-right border-t md:border-t-0 md:border-l border-slate-700 pt-6 md:pt-0 md:pl-8">
                  <p className="text-xs font-bold text-[#3ac47d] uppercase tracking-widest mb-1">Net Salary</p>
                  <p className="text-4xl font-black text-[#3ac47d]">Rs. {calcNetSalary().toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: PERFORMANCE */}
          {activeTab === "performance" && (
            <div className="animate-fade-in-down space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Score</p>
                  <p className="font-bold text-3xl text-[#3ac47d]">{performance?.score ?? "—"}/100</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Warnings</p>
                  <p className="font-bold text-3xl text-red-500">{performance?.warnings ?? 0}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Achievements</p>
                  <p className="font-bold text-3xl text-blue-600">{(performance?.achievements || []).length}</p>
                </div>
              </div>
              {performance?.principalRemarks && <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6"><p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Principal Remarks</p><p className="font-bold text-slate-800">{performance.principalRemarks}</p></div>}
              {(performance?.achievements || []).length > 0 && <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Achievements</p><ul className="list-disc list-inside space-y-1">{performance!.achievements!.map((a, i) => <li key={i} className="font-bold text-slate-700">{a}</li>)}</ul></div>}
              {(performance?.promotions || []).length > 0 && <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Promotions</p><ul className="list-disc list-inside space-y-1">{performance!.promotions!.map((p, i) => <li key={i} className="font-bold text-slate-700">{p}</li>)}</ul></div>}
            </div>
          )}

          {/* TAB 11: TIMELINE */}
          {activeTab === "timeline" && (
            <div className="animate-fade-in-down">
              {!timelineData || (timelineData as any[]).length === 0 ? (
                <p className="text-center text-slate-400 font-bold py-10">No timeline events yet.</p>
              ) : (
                <div className="space-y-4">
                  {(timelineData as any[]).map((entry, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-2 h-2 rounded-full bg-[#3ac47d] mt-2 shrink-0"></div>
                      <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-[#3ac47d] uppercase">{entry.type}</span>
                          {entry.date && <span className="text-xs text-slate-400">{new Date(entry.date).toLocaleDateString()}</span>}
                        </div>
                        <p className="font-bold text-slate-800">{entry.title}</p>
                        <p className="text-sm text-slate-600">{entry.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 12: DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="animate-fade-in-down grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "CNIC Front", url: documents?.cnicFront },
                { label: "CNIC Back", url: documents?.cnicBack },
                { label: "Appointment Letter", url: documents?.appointmentLetter },
                { label: "Contract", url: documents?.contract },
                { label: "CV / Resume", url: documents?.cv },
              ].map((doc, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{doc.label}</p>
                  {doc.url ? <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-bold">View Document</a> : <p className="text-slate-400 text-sm font-bold">Not uploaded</p>}
                </div>
              ))}
            </div>
          )}

          {/* TAB 13: AI SUMMARY */}
          {activeTab === "ai" && (
            <div className="animate-fade-in-down">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles size={24} className="text-purple-600" />
                  <h3 className="font-black text-slate-800 text-lg">AI Staff Analysis</h3>
                </div>
                {aiLoading ? (
                  <div className="flex items-center gap-3 text-slate-500"><div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div> Generating analysis...</div>
                ) : aiSummary ? (
                  <div className="prose prose-sm max-w-none"><p className="text-slate-700 whitespace-pre-wrap">{aiSummary}</p></div>
                ) : (
                  <p className="text-slate-500">Click to generate AI analysis of this staff member.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 14: COMMUNICATION */}
          {activeTab === "communication" && (
            <div className="animate-fade-in-down">
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-center">
                <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="font-bold text-slate-600">Communication Module</p>
                <p className="text-sm text-slate-400 mt-2">Notifications and messaging will be available here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StaffProfilePage() {
  return (
    <Suspense fallback={<div className="p-10 font-bold text-center text-slate-500">Loading Module...</div>}>
      <StaffProfileContent />
    </Suspense>
  );
}
