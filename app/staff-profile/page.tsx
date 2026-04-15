"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Users, Building2, Wallet, GraduationCap, Briefcase, 
  ArrowLeft, Printer, MapPin, Phone, Mail, Calendar, 
  FileText, Download, ShieldCheck, FileCheck
} from "lucide-react";

function StaffProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const staffId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [staffData, setStaffData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    if (staffId) {
      const fetchProfile = async () => {
        try {
          const docRef = doc(db, "staff", staffId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setStaffData({ id: docSnap.id, ...docSnap.data() });
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching staff:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [staffId]);

  if (loading) {
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

  const { personal, professional, education, financial, allowances, deductions, netPayDetails } = staffData;

  const TABS = [
    { id: "personal", label: "Basic Info", icon: Users },
    { id: "education", label: "Educational", icon: GraduationCap },
    { id: "professional", label: "Professional", icon: Briefcase },
    { id: "financial", label: "Financial", icon: Wallet },
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      
      {/* HEADER CONTROLS */}
      <div className="flex justify-between items-center print:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-[#0F172A] font-bold transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          <ArrowLeft size={18} /> Back to Directory
        </button>
        <button onClick={() => window.print()} className="bg-[#3ac47d] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#2eaa6a] transition-all shadow-md">
          <Printer size={18} /> Print Dossier
        </button>
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
                    <span className="text-[#3ac47d] flex items-center gap-1"><ShieldCheck size={16}/> {professional?.designation || "No Designation"}</span> 
                    • BPS {professional?.bps || "-"} • Personnel No: {professional?.personnelNo || "N/A"}
                  </p>
               </div>
            </div>
         </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-100 bg-slate-50/50">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-4 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id ? "border-[#3ac47d] text-[#3ac47d] bg-white" : "border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800"}`}>
              <tab.icon size={16}/> {tab.label}
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
                      <p className="font-bold text-slate-800 flex items-center gap-2"><Calendar size={14} className="text-slate-400"/> {personal?.dob || "N/A"}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gender</p>
                      <p className="font-bold text-slate-800">{personal?.gender || "N/A"}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Marital Status</p>
                      <p className="font-bold text-slate-800">{personal?.maritalStatus || "N/A"}</p>
                   </div>
                 </div>
               </div>
               
               <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Details</p>
                    <p className="font-bold text-slate-800 flex items-center gap-2 mb-2"><Phone size={14} className="text-[#3ac47d]"/> {personal?.phone || "N/A"}</p>
                    <p className="font-bold text-slate-800 flex items-center gap-2"><Mail size={14} className="text-blue-500"/> {personal?.email || "N/A"}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Address</p>
                    <p className="font-bold text-slate-800 flex items-start gap-2"><MapPin size={14} className="text-red-400 shrink-0 mt-1"/> {personal?.currentAddress || "N/A"}</p>
                 </div>
                 {personal?.emergencyContact && (
                   <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-100">
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Emergency Contact</p>
                      <p className="font-bold">{personal.emergencyContact}</p>
                   </div>
                 )}
               </div>
             </div>
           )}

           {/* TAB 2: EDUCATIONAL */}
           {activeTab === "education" && (
             <div className="animate-fade-in-down space-y-4">
                {!education || education.length === 0 ? (
                  <p className="text-slate-400 text-center py-10 font-bold">No educational records found.</p>
                ) : (
                  education.map((edu: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                       <div>
                          <h4 className="text-lg font-black text-[#0F172A]">{edu.level || "Unknown Level"}</h4>
                          <p className="text-sm font-bold text-slate-500 mt-1">{edu.institute || "N/A"} • {edu.passingYear || "N/A"}</p>
                          <p className="text-xs font-bold text-[#3ac47d] mt-2 uppercase tracking-widest">Major: {edu.subjects || "N/A"}</p>
                       </div>
                       
                       {/* Download Document Button if it exists */}
                       {edu.document ? (
                          <a href={edu.document} download={`Degree_${edu.level}.png`} className="bg-white border border-slate-200 text-[#0F172A] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:border-[#3ac47d] hover:text-[#3ac47d] transition-colors shadow-sm">
                             <FileCheck size={16} className="text-green-500"/> View Document
                          </a>
                       ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
                             <FileText size={12}/> No Scan Attached
                          </span>
                       )}
                    </div>
                  ))
                )}
             </div>
           )}

           {/* TAB 3: PROFESSIONAL */}
           {activeTab === "professional" && (
             <div className="animate-fade-in-down grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date of Joining</p>
                  <p className="font-bold text-slate-800 text-lg">{professional?.doj || "N/A"}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Employment Category</p>
                  <p className="font-bold text-[#3ac47d] text-lg">{professional?.empCategory || "N/A"}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">DDO Code</p>
                  <p className="font-bold text-slate-800 text-sm mt-1">{professional?.ddoCode || "N/A"}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 sm:col-span-2 lg:col-span-3 grid grid-cols-2 gap-4">
                  <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Previous Experience</p>
                     <p className="font-bold text-slate-800">{professional?.prevExperience || "Fresh / None"}</p>
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Previous Institution</p>
                     <p className="font-bold text-slate-800">{professional?.prevInstitution || "N/A"}</p>
                  </div>
                </div>
             </div>
           )}

           {/* TAB 4: FINANCIAL */}
           {activeTab === "financial" && (
             <div className="animate-fade-in-down space-y-8">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 
                 {/* Allowances Table */}
                 <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
                       <h4 className="font-black text-blue-800 uppercase tracking-widest text-xs">Pay & Allowances</h4>
                    </div>
                    <div className="divide-y divide-slate-100 bg-white">
                       {allowances && allowances.length > 0 ? allowances.map((a: any, i: number) => (
                         <div key={i} className="px-4 py-2 flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-600">{a.name || "Unnamed"}</span>
                            <span className="text-sm font-black text-[#0F172A]">Rs. {Number(a.amount).toLocaleString()}</span>
                         </div>
                       )) : <div className="p-4 text-center text-sm text-slate-400 font-bold">No Allowances</div>}
                    </div>
                    <div className="bg-blue-500 text-white px-4 py-3 flex justify-between items-center font-black">
                       <span>Gross Pay</span>
                       <span>Rs. {netPayDetails?.grossPay?.toLocaleString() || 0}</span>
                    </div>
                 </div>

                 {/* Deductions Table */}
                 <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    <div className="bg-red-50 px-4 py-3 border-b border-red-100">
                       <h4 className="font-black text-red-800 uppercase tracking-widest text-xs">Deductions</h4>
                    </div>
                    <div className="divide-y divide-slate-100 bg-white">
                       {deductions && deductions.length > 0 ? deductions.map((d: any, i: number) => (
                         <div key={i} className="px-4 py-2 flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-600">{d.name || "Unnamed"}</span>
                            <span className="text-sm font-black text-red-500">- Rs. {Number(d.amount).toLocaleString()}</span>
                         </div>
                       )) : <div className="p-4 text-center text-sm text-slate-400 font-bold">No Deductions</div>}
                    </div>
                    <div className="bg-red-100 text-red-600 px-4 py-3 flex justify-between items-center font-black">
                       <span>Total Deductions</span>
                       <span>Rs. {netPayDetails?.totalDeductions?.toLocaleString() || 0}</span>
                    </div>
                 </div>
               </div>

               {/* Net Salary & Banking */}
               <div className="bg-[#0F172A] rounded-3xl p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
                  <div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Disbursement Account</p>
                     <p className="font-bold text-lg">{financial?.bankName || "No Bank Added"}</p>
                     <p className="text-sm text-slate-300 mt-1">Title: {financial?.accountTitle || "N/A"} • A/C: {financial?.accountNo || "N/A"}</p>
                     <p className="text-xs text-slate-400 mt-1">NTN: {financial?.ntn || "N/A"}</p>
                  </div>
                  <div className="text-right border-t md:border-t-0 md:border-l border-slate-700 pt-6 md:pt-0 md:pl-8">
                     <p className="text-xs font-bold text-[#3ac47d] uppercase tracking-widest mb-1">Final Net Salary</p>
                     <p className="text-4xl font-black text-[#3ac47d]">Rs. {netPayDetails?.netPay?.toLocaleString() || 0}</p>
                  </div>
               </div>

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
