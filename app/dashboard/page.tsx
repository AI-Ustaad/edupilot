"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  CheckSquare, 
  CreditCard, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search,
  ShieldCheck
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // ڈیش بورڈ کے مینوز (Sidebar Links)
  const menuItems = [
    { name: "Overview", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Students", icon: GraduationCap, path: "/dashboard/students" },
    { name: "Staff & HR", icon: Users, path: "/dashboard/staff" },
    { name: "Attendance", icon: CheckSquare, path: "/dashboard/attendance" },
    { name: "Fee Collection", icon: CreditCard, path: "/dashboard/fee" },
    { name: "Settings", icon: Settings, path: "/dashboard/settings" },
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FE] font-sans overflow-hidden">
      
      {/* 1. SIDEBAR (Dark Theme) */}
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0F172A] text-gray-300 flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800/50">
          <div className="flex items-center gap-3 text-white">
            <div className="bg-[#EAB308] p-1.5 rounded-lg shadow-sm">
              <ShieldCheck size={24} className="text-[#0F172A]" />
            </div>
            <span className="text-2xl font-bold tracking-wider">EduPilot</span>
          </div>
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Menu Links */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Main Menu</p>
          
          {menuItems.map((item, index) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={index} 
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-medium ${
                  isActive 
                    ? "bg-[#EAB308] text-[#0F172A] shadow-md" 
                    : "hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon size={20} className={isActive ? "text-[#0F172A]" : "text-gray-400"} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile/Logout */}
        <div className="p-4 border-t border-gray-800/50">
          <Link 
            href="/" 
            className="flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-medium"
          >
            <LogOut size={20} />
            Logout
          </Link>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-gray-500 hover:text-[#0F172A]" 
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={28} />
            </button>
            
            {/* Search Bar (Hidden on very small screens) */}
            <div className="hidden md:flex items-center bg-gray-50 rounded-full px-4 py-2.5 w-64 lg:w-96 border border-gray-100 focus-within:border-gray-300 focus-within:bg-white transition-all">
              <Search size={18} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search students, fees..." 
                className="bg-transparent border-none outline-none text-sm w-full ml-3 text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-gray-400 hover:text-[#0F172A] transition-colors">
              <Bell size={24} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 border-l border-gray-100 pl-6 cursor-pointer">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-[#0F172A]">Imran Haider</p>
                <p className="text-xs text-gray-500 font-medium">School Admin</p>
              </div>
              <div className="w-11 h-11 rounded-full bg-[#0F172A] text-[#EAB308] flex items-center justify-center font-bold text-lg shadow-sm border-2 border-white">
                IH
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content (Children) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8F9FE]">
          {children}
        </main>

      </div>
    </div>
  );
}
