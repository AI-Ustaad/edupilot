"use client";
import React, { useState, useEffect } from "react";
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
  
  // 👉 1. یوزر کا رول (Role) چیک کرنے کی اسٹیٹ
  const [role, setRole] = useState<string>("loading");

  useEffect(() => {
    // API سے رول منگوائیں
    fetch("/api/users/get")
      .then(res => res.json())
      .then(data => setRole(data.role || "teacher"))
      .catch(() => setRole("teacher"));
  }, []);

  const MENU_ITEMS = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard", allowed: ["admin", "teacher"] },
    { name: "Staff Management", icon: UserCircle, path: "/staff", allowed: ["admin"] },
    { name: "Attendance", icon: ClipboardCheck, path: "/attendance", allowed: ["admin", "teacher"] },
    { name: "Time Table", icon: Clock, path: "/timetable", allowed: ["admin", "teacher"] },
    { name: "Students", icon: Users, path: "/students", allowed: ["admin", "teacher"] },
    { name: "Classes", icon: BookOpen, path: "/classes", allowed: ["admin"] },
    { name: "Fees", icon: Wallet, path: "/fees", allowed: ["admin"] },
  ];

  // 👉 2. صرف وہ مینیو دکھائیں جن کی اس رول کو اجازت ہے
  const visibleMenus = MENU_ITEMS.filter(item => item.allowed.includes(role));

  const handleLogout = async () => {
    try {
      await signOut(auth); 
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); 
      router.replace("/login"); 
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
         <div className="flex items-center gap-2 h-20 px-6 border-b border-slate-100">
            <ShieldCheck className="text-[#3ac47d]" size={28} />
            <span className="font-black text-2xl text-[#0F172A]">EduPilot</span>
         </div>

         <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            {/* اگر رول لوڈ ہو رہا ہے تو ہلکا سا اینیمیشن دکھائیں */}
            {role === "loading" ? (
              <div className="animate-pulse space-y-4 p-4">
                <div className="h-8 bg-slate-100 rounded-xl w-full"></div>
                <div className="h-8 bg-slate-100 rounded-xl w-full"></div>
                <div className="h-8 bg-slate-100 rounded-xl w-3/4"></div>
              </div>
            ) : (
              visibleMenus.map((item) => {
                 const isActive = pathname === item.path;
                 return (
                   <Link 
                     key={item.name} 
                     href={item.path}
                     onClick={() => setIsMobileMenuOpen(false)}
                     className={`flex items-center gap-3 px-3 py-3 rounded-xl font-bold transition-all ${isActive ? "bg-green-50 text-[#3ac47d]" : "text-slate-500 hover:bg-slate-50"}`}
                   >
                     <item.icon size={20} />
                     <span className="text-sm">{item.name}</span>
                   </Link>
                 );
              })
            )}
         </div>

         <div className="p-4 border-t border-slate-100 space-y-2">
            {/* 👉 3. ایڈمن سیٹنگز صرف ایڈمن کو نظر آئیں گی */}
            {role === "admin" && (
              <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">
                <Settings size={20} />
                <span className="text-sm">Admin Settings</span>
              </Link>
            )}
            
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-colors">
              <LogOut size={20} />
              <span className="text-sm">Secure Logout</span>
            </button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white relative w-full">
        <button className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white border border-slate-200 text-slate-600 rounded-lg shadow-sm hover:bg-slate-50" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="p-4 md:p-8">{children}</div>
      </div>

      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden animate-fade-in" onClick={() => setIsMobileMenuOpen(false)} />}
    </div>
  );
}
