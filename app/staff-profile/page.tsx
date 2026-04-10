"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, User, Phone, Briefcase, Banknote, ShieldCheck, Printer, Download, Mail, Building } from "lucide-react";

function StaffProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const staffId = searchParams.get("id");
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<any>(null);

  useEffect(() => {
    if (!staffId) return router.push("/staff");
    const fetchStaffData = async () => {
      const docSnap = await getDoc(doc(db, "staff", staffId));
      if (docSnap.exists()) setStaff({ id: docSnap.id, ...docSnap.data() });
      setLoading(false);
    };
    fetchStaffData();
  }, [staffId, router]);

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#3ac47d]"></div></div>;
  if (!staff) return null;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-20 space-y-6">
      
      <div className="flex justify-between print:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm font-bold text-sm"><ArrowLeft size={16}/> Back</button>
        <button onClick={() => window.print()} className="bg-[#3ac47d] text-white px-5 py-2 rounded-lg font-bold text-sm shadow-md flex items-center gap-2"><Printer size={16}/> Print Detail</button>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8">
        <div className="w-32 h-32 rounded-full border-4 border-[#e8f8f0] overflow-hidden shrink-0">
          {staff.photoBase64 ? <img src={staff.photoBase64} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-100 flex items-center justify-center"><User size={48} className="text-slate-300"/></div>}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-[#0F172A] uppercase">{staff.name}</h1>
          <p className="text-[#3ac47d] font-bold mt-1 tracking-wider">{staff.designation}</p>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm font-medium text-slate-500 justify-center md:justify-start">
            <span className="flex items-center gap-1"><ShieldCheck size={16}/> CNIC: {staff.cnic}</span>
            <span className="flex items-center gap-1"><Phone size={16}/> {staff.phone}</span>
            {staff.email && <span className="flex items-center gap-1"><Mail size={16}/> {staff.email}</span>}
          </div>
        </div>
        
        {/* نیا: ڈاکومنٹ ڈاؤنلوڈ/ویو بٹن */}
        {staff.documentBase64 && (
          <div className="shrink-0 print:hidden">
            <a href={staff.documentBase64} download={staff.documentName || "document"} className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors">
              <Download size={18} /> Attached Document
            </a>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Professional Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Briefcase size={16} /> Service Profile</h3>
            <div className="space-y-4">
              <div><p className="text-xs text-gray-400">Personnel Number</p><p className="font-bold text-sm">{staff.personnelNo || "N/A"}</p></div>
              <div><p className="text-xs text-gray-400">BPS Scale</p><p className="font-bold text-sm">{staff.scale || "N/A"}</p></div>
              <div><p className="text-xs text-gray-400">Employment Category</p><p className="font-bold text-sm">{staff.employmentCategory || "N/A"}</p></div>
              <div><p className="text-xs text-gray-400">Bank Account Details</p><p className="font-bold text-sm text-blue-600">{staff.bankAccount || "N/A"}</p></div>
            </div>
          </div>
        </div>

        {/* Right Col: Financial Breakdown (The real magic) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-[#3ac47d] uppercase tracking-widest mb-6 flex items-center gap-2"><Banknote size={16} /> Comprehensive Financial Breakdown</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Earnings Table */}
            <div>
              <h4 className="font-bold text-slate-800 mb-3 border-b pb-2">Pay & Allowances (Earnings)</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-slate-500">Basic Pay</span><span className="font-bold">Rs {staff.basicPay}</span></div>
                {staff.allowances && staff.allowances.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm"><span className="text-slate-500">{item.name}</span><span className="font-medium">Rs {item.amount}</span></div>
                ))}
                <div className="flex justify-between text-sm pt-2 border-t font-bold text-slate-800"><span>Gross Pay</span><span>Rs {staff.grossPay}</span></div>
              </div>
            </div>

            {/* Deductions Table */}
            <div>
              <h4 className="font-bold text-red-500 mb-3 border-b pb-2">Deductions</h4>
              <div className="space-y-2">
                {staff.deductionsList && staff.deductionsList.length > 0 ? staff.deductionsList.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm"><span className="text-slate-500">{item.name}</span><span className="font-medium text-red-500">- Rs {item.amount}</span></div>
                )) : <p className="text-sm text-slate-400">No deductions recorded.</p>}
                <div className="flex justify-between text-sm pt-2 border-t font-bold text-red-500"><span>Total Deductions</span><span>- Rs {staff.deductionsTotal}</span></div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-[#f0fdf4] border border-green-100 rounded-2xl p-6 flex items-center justify-between">
             <span className="text-green-800 font-black uppercase tracking-widest">Final Net Pay</span>
             <span className="text-3xl font-black text-[#3ac47d]">Rs {staff.netPay ? Number(staff.netPay).toLocaleString() : "0"}</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function StaffProfilePage() {
  return <Suspense fallback={<div className="h-screen flex items-center justify-center text-[#3ac47d]">Loading...</div>}><StaffProfileContent /></Suspense>;
}
