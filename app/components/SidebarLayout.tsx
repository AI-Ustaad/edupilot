"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Users, BookOpen, UserCircle, 
  ClipboardCheck, Wallet, PenTool, Award, 
  Clock, Settings, Menu, X, ShieldCheck
} from "lucide-react";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // آپ کے سائیڈ بار کے تمام لنکس (تصویر کے مطابق)
  const MENU_ITEMS = [
    { name: "Analytics", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Students", icon: Users, path: "/students" },
    { name: "Classes", icon: BookOpen, path: "/classes" },
    { name: "Staff", icon: UserCircle, path: "/staff" },
    { name: "Attendance", icon: ClipboardCheck, path: "/attendance" },
    { name: "Fee Collection", icon: Wallet, path: "/fees" },
    { name: "Exams & Marks", icon: PenTool, path: "/marks" },
    { name: "Results", icon: Award, path: "/result" },
    { name: "Time Table", icon: Clock, path: "/timetable" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* 🚀 MOBILE HEADER (صرف موبائل پر نظر آئے گا) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2">
           <ShieldCheck className="text-[#3ac47d]" size={24} />
           <span className="font-black text-xl text-[#0F172A] tracking-tight">EduPilot</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 🚀 THE SIDEBAR (موبائل پر چھپا ہوگا، ڈیسک ٹاپ پر پکا نظر آئے گا) */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}>
         
         {/* Desktop Logo */}
         <div className="hidden md:flex items-center gap-2 h-20 px-6 border-b border-slate-100">
            <ShieldCheck className="text-[#3ac47d]" size={28} />
            <span className="font-black text-2xl text-[#0F172A] tracking-tight">EduPilot</span>
         </div>

         {/* Navigation Links */}
         <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3 mb-3">Main Menu</p>
            {MENU_ITEMS.map((item) => {
               const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
               return (
                 <Link 
                   key={item.name} 
                   href={item.path}
                   onClick={() => setIsMobileMenuOpen(false)} // موبائل پر کلک کرنے کے بعد مینیو بند کر دے گا
                   className={`flex items-center gap-3 px-3 py-3 rounded-xl font-bold transition-all duration-200 ${isActive ? "bg-green-50 text-[#3ac47d]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
                 >
                   <item.icon size={20} className={isActive ? "text-[#3ac47d]" : "text-slate-400"} />
                   <span className="text-sm">{item.name}</span>
                 </Link>
               );
            })}
         </div>

         {/* Settings Button at Bottom */}
         <div className="p-4 border-t border-slate-100">
            <Link 
              href="/settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl font-bold transition-all duration-200 ${pathname.includes('/settings') ? "bg-[#0F172A] text-white shadow-md" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
            >
              <Settings size={20} className={pathname.includes('/settings') ? "text-slate-300" : "text-slate-400"} />
              <span className="text-sm">Settings</span>
            </Link>
         </div>
      </div>

      {/* 🚀 OVERLAY FOR MOBILE (موبائل پر سائیڈ بار کھلنے پر پیچھے اندھیرا کرے گا) */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)} 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
        ></div>
      )}

      {/* 🚀 MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto pt-20 md:pt-0 bg-slate-50/50 relative">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
           {children}
        </div>
      </div>

    </div>
  );
}
