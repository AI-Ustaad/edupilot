/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
"use client";
import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Users, Building2, Wallet, GraduationCap, Briefcase,
  ArrowLeft, Printer, MapPin, Phone, Mail, Calendar,
  FileText, ShieldCheck, Heart, BookOpen, Award, AlertTriangle,
} from "lucide-react";
import { useStaffMember } from "@/hooks/useStaff";
import type { Staff } from "@/types/staff";

function StaffProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const staffId = searchParams.get("id");

  const { data: staffData, isLoading } = useStaffMember(staffId || "");
  const [activeTab, setActiveTab] = useState("personal");

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
  const { personal, contact, professional, payroll, academic, emergency, documents, performance } = staff;

  const TABS = [
    { id: "personal", label: "Basic Info", icon: Users },
    { id: "professional", label: "Professional", icon: Briefcase },
    { id: "financial", label: "Financial", icon: Wallet },
    { id: "academic", label: "Academic", icon: BookOpen },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "emergency", label: "Emergency", icon: Heart },
    { id: "performance", label: "Performance", icon: Award },
  ];

  const calcNetSalary = () => {
    const basic = payroll?.basicSalary || 0;
    const allowances = (payroll?.allowances || []).reduce((s, a) => s + (a.amount || 0), 0);
    const deductions = (payroll?.deductions || []).reduce((s, d) => s + (d.amount || 0), 0);
    return basic + allowances - deductions;
  };

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      {/* HEADER CONTROLS */}
      <div className="flex justify-between items-center print:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-[#0F172A] font-bold transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          <ArrowLeft size={18} /> Back to Directory
        </button>
        <div className="flex gap-2">
          <button onClick={() => router.push(`/staff/${staffId}/edit`)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md">
            Edit Profile
          </button>
          <button onClick={() => window.print()} className="bg-[#3ac47d] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#2eaa6a] transition-all shadow-md">
            <Printer size={18} /> Print Dossier
          </button>
        </div>
      </div>

      {/* TOP PROFILE BANNER */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="h-32 bg-[#3ac47d] w-full"></div>
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16 mb-4">
            <div className="w-32 h-32 bg-white rounded-2xl border-4 border-white shadow-lg overflow-hidden shrink-0 flex items-center justify-center">
              {personal?.photo ? (
                <img src={personal.photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Users size={40} className="text-slate-300" />
              )}
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-black text-[#0F172A] uppercase">{personal?.fullName || "N/A"}</h1>
              <p className="text-sm font-bold text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                <span className="text-[#3ac47d] flex items-center gap-1"><ShieldCheck size={16} /> {professional?.designation || "No Designation"}</span>
                {professional?.department && <span>• {professional.department}</span>}
                <span>• Personnel No: {professional?.personnelNo || "N/A"}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-100 bg-slate-50/50">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-4 px-3 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id ? "border-[#3ac47d] text-[#3ac47d] bg-white" : "border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800"}`}>
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8 min-h-[400px]">
          {/* TAB 1: PERSONAL INFO */}
          {activeTab === "personal" && (
            <div className="animate-fade-in-down grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Father / Husband Name</p>
                  <p className="font-bold text-slate-800">{personal?.fatherName || "N/A"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">CNIC Number</p>
                    <p className="font-bold text-slate-800">{personal?.cnic || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date of Birth</p>
                    <p className="font-bold text-slate-800 flex items-center gap-2"><Calendar size={14} className="text-slate-400" /> {personal?.dob || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gender</p>
                    <p className="font-bold text-slate-800">{personal?.gender || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Marital Status</p>
                    <p className="font-bold text-slate-800">{personal?.maritalStatus || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Blood Group</p>
                    <p className="font-bold text-slate-800">{personal?.bloodGroup || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nationality</p>
                    <p className="font-bold text-slate-800">{personal?.nationality || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Religion</p>
                    <p className="font-bold text-slate-800">{personal?.religion || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Contact Details</p>
                  <p className="font-bold text-slate-800 flex items-center gap-2 mb-2"><Phone size={14} className="text-[#3ac47d]" /> {contact?.mobile || "N/A"}</p>
                  {contact?.whatsapp && <p className="font-bold text-slate-800 flex items-center gap-2 mb-2"><Phone size={14} className="text-green-500" /> WhatsApp: {contact.whatsapp}</p>}
                  <p className="font-bold text-slate-800 flex items-center gap-2 mb-2"><Mail size={14} className="text-blue-500" /> {contact?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Address</p>
                  <p className="font-bold text-slate-800 flex items-start gap-2"><MapPin size={14} className="text-red-400 shrink-0 mt-1" /> {contact?.currentAddress || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Permanent Address</p>
                  <p className="font-bold text-slate-800 flex items-start gap-2"><MapPin size={14} className="text-red-400 shrink-0 mt-1" /> {contact?.permanentAddress || "N/A"}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">City</p>
                    <p className="font-bold text-slate-800">{contact?.city || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Province</p>
                    <p className="font-bold text-slate-800">{contact?.province || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Country</p>
                    <p className="font-bold text-slate-800">{contact?.country || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Postal Code</p>
                    <p className="font-bold text-slate-800">{contact?.postalCode || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFESSIONAL */}
          {activeTab === "professional" && (
            <div className="animate-fade-in-down grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Personnel Number</p>
                <p className="font-bold text-slate-800 text-lg">{professional?.personnelNo || "N/A"}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Employee ID</p>
                <p className="font-bold text-slate-800 text-lg">{professional?.employeeId || "N/A"}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Designation</p>
                <p className="font-bold text-[#3ac47d] text-lg">{professional?.designation || "N/A"}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Department</p>
                <p className="font-bold text-slate-800 text-lg">{professional?.department || "N/A"}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Role</p>
                <p className="font-bold text-slate-800 text-lg">{professional?.role || "N/A"}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Employment Type</p>
                <p className="font-bold text-slate-800 text-lg">{professional?.employmentType || "N/A"}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date of Joining</p>
                <p className="font-bold text-slate-800 text-lg">{professional?.joiningDate || "N/A"}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Confirmation Date</p>
                <p className="font-bold text-slate-800 text-lg">{professional?.confirmationDate || "N/A"}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Qualification</p>
                <p className="font-bold text-slate-800 text-lg">{professional?.qualification || "N/A"}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 sm:col-span-2 lg:col-span-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Experience</p>
                <p className="font-bold text-slate-800">{professional?.experience || "Fresh / None"}</p>
              </div>
            </div>
          )}

          {/* TAB 3: FINANCIAL */}
          {activeTab === "financial" && (
            <div className="animate-fade-in-down space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Allowances Table */}
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
                    <h4 className="font-black text-blue-800 uppercase tracking-widest text-xs">Pay & Allowances</h4>
                  </div>
                  <div className="divide-y divide-slate-100 bg-white">
                    {payroll?.basicSalary ? (
                      <div className="px-4 py-2 flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-600">Basic Salary</span>
                        <span className="text-sm font-black text-[#0F172A]">Rs. {payroll.basicSalary.toLocaleString()}</span>
                      </div>
                    ) : null}
                    {(payroll?.allowances || []).length > 0 ? payroll!.allowances!.map((a, i) => (
                      <div key={i} className="px-4 py-2 flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-600">{a.name || "Unnamed"}</span>
                        <span className="text-sm font-black text-[#0F172A]">Rs. {(a.amount || 0).toLocaleString()}</span>
                      </div>
                    )) : <div className="p-4 text-center text-sm text-slate-400 font-bold">No Allowances</div>}
                  </div>
                  <div className="bg-blue-500 text-white px-4 py-3 flex justify-between items-center font-black">
                    <span>Gross Pay</span>
                    <span>Rs. {(payroll?.grossSalary || (payroll?.basicSalary || 0) + (payroll?.allowances || []).reduce((s, a) => s + (a.amount || 0), 0)).toLocaleString()}</span>
                  </div>
                </div>

                {/* Deductions Table */}
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <div className="bg-red-50 px-4 py-3 border-b border-red-100">
                    <h4 className="font-black text-red-800 uppercase tracking-widest text-xs">Deductions</h4>
                  </div>
                  <div className="divide-y divide-slate-100 bg-white">
                    {(payroll?.deductions || []).length > 0 ? payroll!.deductions!.map((d, i) => (
                      <div key={i} className="px-4 py-2 flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-600">{d.name || "Unnamed"}</span>
                        <span className="text-sm font-black text-red-500">- Rs. {(d.amount || 0).toLocaleString()}</span>
                      </div>
                    )) : <div className="p-4 text-center text-sm text-slate-400 font-bold">No Deductions</div>}
                  </div>
                  <div className="bg-red-100 text-red-600 px-4 py-3 flex justify-between items-center font-black">
                    <span>Total Deductions</span>
                    <span>Rs. {(payroll?.deductions || []).reduce((s, d) => s + (d.amount || 0), 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Net Salary & Banking */}
              <div className="bg-[#0F172A] rounded-3xl p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Disbursement Account</p>
                  <p className="font-bold text-lg">{payroll?.bankName || "No Bank Added"}</p>
                  <p className="text-sm text-slate-300 mt-1">A/C: {payroll?.accountNumber || "N/A"} {payroll?.iban ? `• IBAN: ${payroll.iban}` : ""}</p>
                  <p className="text-xs text-slate-400 mt-1">Payment Method: {payroll?.salaryPaymentMethod || "N/A"}</p>
                </div>
                <div className="text-right border-t md:border-t-0 md:border-l border-slate-700 pt-6 md:pt-0 md:pl-8">
                  <p className="text-xs font-bold text-[#3ac47d] uppercase tracking-widest mb-1">Final Net Salary</p>
                  <p className="text-4xl font-black text-[#3ac47d]">Rs. {calcNetSalary().toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACADEMIC */}
          {activeTab === "academic" && (
            <div className="animate-fade-in-down space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Class Teacher</p>
                  <p className="font-bold text-slate-800 text-lg">{academic?.classTeacher ? "Yes" : "No"}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Section</p>
                  <p className="font-bold text-slate-800 text-lg">{academic?.sectionAssignment || "N/A"}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Assigned Subjects</p>
                <div className="flex flex-wrap gap-2">
                  {(academic?.subjects || []).length > 0 ? academic!.subjects!.map((s, i) => (
                    <span key={i} className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold">{s}</span>
                  )) : <p className="text-slate-400 font-bold text-sm">No subjects assigned</p>}
                </div>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Assigned Classes</p>
                <div className="flex flex-wrap gap-2">
                  {(academic?.classesAssigned || []).length > 0 ? academic!.classesAssigned!.map((c, i) => (
                    <span key={i} className="bg-green-50 text-green-700 border border-green-100 px-3 py-1 rounded-full text-xs font-bold">{c}</span>
                  )) : <p className="text-slate-400 font-bold text-sm">No classes assigned</p>}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="animate-fade-in-down grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "CNIC Front", url: documents?.cnicFront },
                { label: "CNIC Back", url: documents?.cnicBack },
                { label: "Appointment Letter", url: documents?.appointmentLetter },
                { label: "Contract", url: documents?.contract },
                { label: "CV / Resume", url: documents?.cv },
              ].map((doc, i) => (
                <div key={i} className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{doc.label}</p>
                  {doc.url ? (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-bold">View Document</a>
                  ) : (
                    <p className="text-slate-400 text-sm font-bold">Not uploaded</p>
                  )}
                </div>
              ))}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Degree Certificates</p>
                {(documents?.degreeCertificates || []).length > 0 ? (
                  <div className="space-y-1">{documents!.degreeCertificates!.map((d, i) => (
                    <a key={i} href={d} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-bold block">Certificate {i + 1}</a>
                  ))}</div>
                ) : <p className="text-slate-400 text-sm font-bold">None uploaded</p>}
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Experience Certificates</p>
                {(documents?.experienceCertificates || []).length > 0 ? (
                  <div className="space-y-1">{documents!.experienceCertificates!.map((d, i) => (
                    <a key={i} href={d} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-bold block">Certificate {i + 1}</a>
                  ))}</div>
                ) : <p className="text-slate-400 text-sm font-bold">None uploaded</p>}
              </div>
            </div>
          )}

          {/* TAB 6: EMERGENCY CONTACT */}
          {activeTab === "emergency" && (
            <div className="animate-fade-in-down">
              <div className="bg-red-50 border border-red-100 rounded-2xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Contact Name</p>
                    <p className="font-bold text-slate-800 text-lg">{emergency?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Relationship</p>
                    <p className="font-bold text-slate-800 text-lg">{emergency?.relation || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Phone</p>
                    <p className="font-bold text-slate-800 text-lg flex items-center gap-2"><Phone size={16} className="text-red-500" /> {emergency?.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Alternate Phone</p>
                    <p className="font-bold text-slate-800 text-lg flex items-center gap-2"><Phone size={16} className="text-red-400" /> {emergency?.alternatePhone || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PERFORMANCE */}
          {activeTab === "performance" && (
            <div className="animate-fade-in-down space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Performance Score</p>
                  <p className="font-bold text-3xl text-[#3ac47d]">{performance?.score ?? "—"}/100</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Warnings</p>
                  <p className="font-bold text-3xl text-red-500 flex items-center gap-2">{performance?.warnings ?? 0} <AlertTriangle size={20} /></p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Achievements</p>
                  <p className="font-bold text-3xl text-blue-600">{(performance?.achievements || []).length}</p>
                </div>
              </div>
              {performance?.principalRemarks && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Principal Remarks</p>
                  <p className="font-bold text-slate-800">{performance.principalRemarks}</p>
                </div>
              )}
              {(performance?.achievements || []).length > 0 && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Achievements</p>
                  <ul className="list-disc list-inside space-y-1">{performance!.achievements!.map((a, i) => <li key={i} className="font-bold text-slate-700">{a}</li>)}</ul>
                </div>
              )}
              {(performance?.promotions || []).length > 0 && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Promotion History</p>
                  <ul className="list-disc list-inside space-y-1">{performance!.promotions!.map((p, i) => <li key={i} className="font-bold text-slate-700">{p}</li>)}</ul>
                </div>
              )}
              {(performance?.trainingHistory || []).length > 0 && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Training History</p>
                  <ul className="list-disc list-inside space-y-1">{performance!.trainingHistory!.map((t, i) => <li key={i} className="font-bold text-slate-700">{t}</li>)}</ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrapping in Suspense for Next.js build safety
export default function StaffProfilePage() {
  return (
    <Suspense fallback={<div className="p-10 font-bold text-center text-slate-500">Loading Module...</div>}>
      <StaffProfileContent />
    </Suspense>
  );
}
