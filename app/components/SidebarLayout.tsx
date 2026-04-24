"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { 
  LayoutDashboard, Users, BookOpen, UserCircle, 
  ClipboardCheck, Wallet, Clock, Settings, Menu, X, ShieldCheck, LogOut 
} from "lucide-react";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const MENU_ITEMS = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Staff Management", icon: UserCircle, path: "/staff" },
    { name: "Attendance", icon: ClipboardCheck, path: "/attendance" },
    { name: "Time Table", icon: Clock, path: "/timetable" },
    { name: "Students", icon: Users, path: "/students" },
    { name: "Classes", icon: BookOpen, path: "/classes" },
    { name: "Fees", icon: Wallet, path: "/fees" },
  ];

  // 👉 نیا لاگ آؤٹ فنکشن (سیکیورٹی کے ساتھ)
  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase سے آؤٹ
      await fetch("/api/auth/logout", { method: "POST" }); // سرور کوکی (Cookie) صاف کریں
      router.push("/login"); // لاگ ان پیج پر بھیج دیں
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Sidebar for Desktop */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
         
         <div className="flex items-center gap-2 h-20 px-6 border-b border-slate-100">
            <ShieldCheck className="text-[#3ac47d]" size={28} />
            <span className="font-black text-2xl text-[#0F172A]">EduPilot</span>
         </div>

         <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            {MENU_ITEMS.map((item) => {
               const isActive = pathname === item.path;
               return (
                 <Link 
                   key={item.name} 
                   href={item.path}
                   className={`flex items-center gap-3 px-3 py-3 rounded-xl font-bold transition-all ${isActive ? "bg-green-50 text-[#3ac47d]" : "text-slate-500 hover:bg-slate-50"}`}
                 >
                   <item.icon size={20} />
                   <span className="text-sm">{item.name}</span>
                 </Link>
               );
            })}
         </div>

         <div className="p-4 border-t border-slate-100">
            <Link href="/settings" className="flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50">
              <Settings size={20} />
              <span className="text-sm">Admin Settings</span>
            </Link>
            {/* 👉 نیا لاگ آؤٹ کا بٹن */}
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-colors mt-2">
              <LogOut size={20} />
              <span className="text-sm">Secure Logout</span>
            </button>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-white relative">
        <button 
          className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white border rounded-md"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
        <div className="p-4 md:p-8">
           {children}
        </div>
      </div>
    </div>
  );
}
