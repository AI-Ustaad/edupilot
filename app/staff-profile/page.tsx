"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, User, Phone, Briefcase, GraduationCap, Banknote, ShieldCheck, Printer } from "lucide-react";

function StaffProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const staffId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<any>(null);

  useEffect(() => {
    if (!staffId) {
      router.push("/staff");
      return;
    }

    const fetchStaffData = async () => {
      try {
        const docRef = doc(db, "staff", staffId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setStaff({ id: docSnap.id, ...docSnap.data() });
        } else {
          alert("Staff member not found!");
          router.push("/staff");
        }
      } catch (error) {
        console.error("Error fetching staff profile: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [staffId, router]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3ac47d]"></div>
      </div>
    );
  }

  if (!staff) return null;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-20">
      
      {/* Top Header & Actions */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-[#3ac47d] transition-colors font-bold text-sm bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          <ArrowLeft size={16} /> Back to Directory
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#3ac47d] text-white px-5 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-[#2eaa6a] transition-all">
          <Printer size={16} /> Print Profile
        </button>
      </div>

      {/* Hero Section (Cover & Avatar) */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8 relative">
        <div className="h-40 bg-gradient-to-r from-[#0F172A] to-[#1e293b] relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10"><Briefcase size={120} /></div>
        </div>
        
        <div className="px-8 pb-8 relative flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16">
          <div className="w-32 h-32 rounded-2xl bg-white p-1.5 shadow-lg shrink-0">
            {staff.photoBase64 ? (
              <img src={staff.photoBase64} alt="Staff" className="w-full h-full rounded-xl object-cover" />
            ) : (
              <div className="w-full h-full rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center"><User size={48} /></div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left mb-2">
            <h1 className="text-3xl font-extrabold text-[#0F172A]">{staff.name}</h1>
            <p className="text-[#3ac47d] font-bold text-sm mt-1 uppercase tracking-wider">{staff.designation || "Staff Member"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Identity & Contact */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2"><ShieldCheck size={16} /> Personal Identity</h3>
            <div className="space-y-4">
              <div><p className="text-xs text-gray-400">CNIC Number</p><p className="font-bold text-sm text-[#0F172A]">{staff.cnic || "N/A"}</p></div>
              <div><p className="text-xs text-gray-400">Phone Number</p><p className="font-bold text-sm text-blue-600">{staff.phone || "N/A"}</p></div>
              <div><p className="text-xs text-gray-400">Gender</p><p className="font-bold text-sm text-[#0F172A]">{staff.gender || "N/A"}</p></div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2"><GraduationCap size={16} /> Professional Background</h3>
            <div className="space-y-4">
              <div><p className="text-xs text-gray-400">Education</p><p className="font-bold text-sm text-[#0F172A]">{staff.education || "N/A"}</p></div>
              <div><p className="text-xs text-gray-400">Experience</p><p className="font-bold text-sm text-[#0F172A]">{staff.experience || "N/A"}</p></div>
            </div>
          </div>
        </div>

        {/* Financials (Salary Details) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit">
          <h3 className="text-sm font-bold text-[#3ac47d] uppercase tracking-widest mb-5 flex items-center gap-2"><Banknote size={16} /> Salary & Financials</h3>
          
          <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <p className="text-sm text-slate-500 font-medium">Basic Pay</p>
              <p className="font-bold text-slate-800">Rs {staff.basicPay ? Number(staff.basicPay).toLocaleString() : "0"}</p>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <p className="text-sm text-slate-500 font-medium">Gross Pay</p>
              <p className="font-bold text-slate-800">Rs {staff.grossPay ? Number(staff.grossPay).toLocaleString() : "0"}</p>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <p className="text-sm text-red-400 font-medium">Deductions</p>
              <p className="font-bold text-red-500">- Rs {staff.deductions ? Number(staff.deductions).toLocaleString() : "0"}</p>
            </div>
            <div className="flex justify-between items-center pt-2">
              <p className="text-sm text-[#3ac47d] font-black uppercase tracking-widest">Net Pay</p>
              <p className="font-black text-xl text-[#3ac47d]">Rs {staff.netPay ? Number(staff.netPay).toLocaleString() : "0"}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function StaffProfilePage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center text-[#3ac47d] font-bold">Loading Profile...</div>}>
      <StaffProfileContent />
    </Suspense>
  );
}
