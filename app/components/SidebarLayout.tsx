"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, Users, GraduationCap, CheckSquare, CreditCard, Settings, LogOut, Menu, X, Bell, Search, ShieldCheck, ClipboardEdit, Award
} from "lucide-react";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { role } = useAuth();

  const allMenuItems = [
    { name: "Analytics", icon: LayoutDashboard, path: "/dashboard", roles: ["admin", "teacher", "student"] },
    { name: "Students", icon: GraduationCap, path: "/students", roles: ["admin"] },
    { name: "Staff", icon: Users, path: "/staff", roles: ["admin"] },
    { name: "Attendance", icon: CheckSquare, path: "/attendance", roles: ["admin", "teacher"] },
    { name: "Fee Collection", icon: CreditCard, path: "/fees", roles: ["admin"] },
    { name: "Exams & Marks", icon: ClipboardEdit, path: "/marks", roles: ["admin", "teacher"] },
    { name: "Results", icon: Award, path: "/result", roles: ["admin", "student"] },
    { name: "Settings", icon: Settings, path: "/settings", roles: ["admin"] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(role || "student"));

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="flex h-screen bg-[#f1f4f6] font-sans overflow-hidden">
      
      {sidebarOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#3ac47d] text-white flex flex-col transition-transform duration-300 ease-in-out shadow-xl ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-20 flex items-center justify-center px-6 border-b border-white/10 shadow-sm bg-[#3ac47d]">
          <div className="flex items-center gap-3">
            <ShieldCheck size={28} className="text-white" />
            <span className="text-2xl font-bold tracking-wide">EduPilot</span>
          </div>
          <button className="lg:hidden absolute right-4 text-white/70 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-bold text-white/60 uppercase tracking-widest mb-4">Dashboard Widgets</p>
          {menuItems.map((item, index) => {
            const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`);
            return (
              <Link 
                key={index} 
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all font-medium text-sm ${
                  isActive 
                    ? "bg-white text-[#3ac47d] shadow-md" 
                    : "text-white hover:bg-white/10"
                }`}
              >
                <item.icon size={18} className={isActive ? "text-[#3ac47d]" : "text-white/80"} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all font-medium text-sm"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-500 hover:text-[#3ac47d]" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-64 lg:w-80 border border-transparent focus-within:border-[#3ac47d] focus-within:bg-white transition-all">
              <Search size={16} className="text-gray-400" />
              <input type="text" placeholder="Search data..." className="bg-transparent border-none outline-none text-sm w-full ml-3 text-gray-700 placeholder-gray-400" />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button className="relative text-gray-400 hover:text-[#3ac47d] transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center gap-3 border-l border-gray-200 pl-5 cursor-pointer">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-700 capitalize">{role || "User"}</p>
                <p className="text-xs text-gray-400 font-medium">EduPilot</p>
              </div>
              <img src={`https://ui-avatars.com/api/?name=${role || "U"}&background=3ac47d&color=fff`} alt="Profile" className="w-9 h-9 rounded-full shadow-sm" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f1f4f6] p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
