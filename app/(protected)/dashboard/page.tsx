import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import Link from "next/link";
import { 
  Users, Briefcase, ClipboardCheck, Wallet, 
  ArrowRight, ShieldCheck, Activity, TrendingUp 
} from "lucide-react";

export default async function DashboardPage() {
  // 1. 🔒 سیکیورٹی چیک: سیشن کوکی پکڑیں
  const sessionCookie = cookies().get("session")?.value;
  if (!sessionCookie) redirect("/login");

  let decodedClaims;
  let tenantData;
  let stats = { students: 0, staff: 0, todayAttendance: 0, fees: 0 };

  try {
    // 2. کوکی کو وویریفائی کر کے یوزر اور Tenant ID نکالیں
    decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const tenantId = decodedClaims.tenantId;
    
    // 3. فائر بیس سے Tenant (اسکول) کا ڈیٹا منگوائیں
    const tenantDoc = await adminDb.collection("tenants").doc(tenantId).get();
    tenantData = tenantDoc.data();

    // 🚀 اگر سیٹ اپ مکمل نہیں ہوا، تو زبردستی Wizard پر بھیج دیں
    if (!tenantData?.setupCompleted) {
       redirect("/setup"); 
    }

    // 4. 📊 سمارٹ کاؤنٹس (Smart Aggregation) - یہ پورے ڈاکومنٹس ریڈ نہیں کرتا، صرف گنتی کرتا ہے (پیسے بچاتا ہے)
    const [studentsSnap, staffSnap] = await Promise.all([
      adminDb.collection("students").where("tenantId", "==", tenantId).count().get(),
      adminDb.collection("staff").where("tenantId", "==", tenantId).count().get()
    ]);

    stats.students = studentsSnap.data().count;
    stats.staff = staffSnap.data().count;

  } catch (error) {
    console.error("Dashboard Auth Error:", error);
    redirect("/login");
  }

  // 🎨 ڈیش بورڈ کے کارڈز کا ڈیٹا
  const STAT_CARDS = [
    { title: "Total Students", value: stats.students, icon: Users, color: "bg-blue-50 text-blue-600", border: "border-blue-100" },
    { title: "Active Staff", value: stats.staff, icon: Briefcase, color: "bg-indigo-50 text-indigo-600", border: "border-indigo-100" },
    { title: "Today's Attendance", value: "---", icon: ClipboardCheck, color: "bg-emerald-50 text-emerald-600", border: "border-emerald-100" },
    { title: "Revenue (This Month)", value: "Rs 0", icon: Wallet, color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
  ];

  return (
    <div className="animate-fade-in space-y-8 pb-20 w-full">
      
      {/* 🌟 ہیڈر سیکشن */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden w-full">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="text-emerald-500" size={20} />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
              Verified Tenant Identity
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight uppercase">
            {tenantData?.name || "Command Centre"}
          </h1>
          <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">
            Welcome back to your secure workspace
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <Activity className="text-blue-500 animate-pulse" size={24} />
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Status</p>
            <p className="text-sm font-black text-[#0F172A] uppercase">All Systems Optimal</p>
          </div>
        </div>
      </div>

      {/* 📊 اسٹیٹس کارڈز (Stats Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {STAT_CARDS.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 ${stat.color} rounded-bl-3xl border-b border-l ${stat.border}`}>
              <stat.icon size={24} />
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2">{stat.title}</p>
            <h2 className="text-4xl font-black text-[#0F172A] mt-2 group-hover:scale-105 transition-transform origin-left">
              {stat.value}
            </h2>
          </div>
        ))}
      </div>

      {/* ⚡ کوئیک ایکشنز (Quick Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-blue-500" size={20} />
            <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-widest">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/students" className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group">
              <div>
                <p className="font-black text-[#0F172A] text-sm uppercase">Add Student</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">New Admission</p>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link href="/attendance" className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors group">
              <div>
                <p className="font-black text-[#0F172A] text-sm uppercase">Attendance</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Mark Daily Register</p>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link href="/fees" className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-colors group">
              <div>
                <p className="font-black text-[#0F172A] text-sm uppercase">Collect Fee</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Issue Receipt</p>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link href="/settings" className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors group">
              <div>
                <p className="font-black text-[#0F172A] text-sm uppercase">Settings</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">System Config</p>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-lg text-white flex flex-col justify-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20"></div>
           <h3 className="text-xl font-black uppercase tracking-tight mb-2 relative z-10">System Ready</h3>
           <p className="text-sm font-bold text-slate-400 mb-6 relative z-10">
             Your workspace is fully isolated and secure. Multi-tenant architecture is actively protecting your data.
           </p>
           <div className="flex gap-2 relative z-10">
              <span className="bg-slate-800 text-emerald-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Protected
              </span>
              <span className="bg-slate-800 text-blue-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-700">
                v2.0 Active
              </span>
           </div>
        </div>

      </div>
    </div>
  );
}
