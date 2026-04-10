"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, Users, GraduationCap, CheckSquare, CreditCard, Settings, LogOut, Menu, X, Bell, Search, ShieldCheck, ClipboardEdit, Award, User as UserIcon
} from "lucide-react";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout } = useAuth();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // مینیو سے باہر کلک کرنے پر اسے بند کرنے کا لاجک
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allMenuItems = [
    { name: "Analytics", icon: LayoutDashboard, path: "/dashboard", roles: ["admin", "teacher", "student", "staff"] },
    { name: "Students", icon: GraduationCap, path: "/students", roles: ["admin", "staff"] },
    { name: "Staff", icon: Users, path: "/staff", roles: ["admin"] },
    { name: "Attendance", icon: CheckSquare, path: "/attendance", roles: ["admin", "teacher"] },
    { name: "Fee Collection", icon: CreditCard, path: "/fees", roles: ["admin", "staff"] },
    { name: "Exams & Marks", icon: ClipboardEdit, path: "/marks", roles: ["admin", "teacher"] },
    { name: "Results", icon: Award, path: "/result", roles: ["admin", "student"] },
    { name: "Settings", icon: Settings, path: "/settings", roles: ["admin"] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(role || "student"));

  const handleLogout = async () => {
    setProfileMenuOpen(false);
    await logout();
    router.push("/login");
  };

  // رول کو خوبصورت فارمیٹ میں دکھانے کے لیے (e.g., admin -> Principal)
  const getDisplayRole = (roleStr: string | null) => {
    switch(roleStr) {
      case 'admin': return 'Principal / Admin';
      case 'staff': return 'Staff Account';
      default: return roleStr ? roleStr.charAt(0).toUpperCase() + roleStr.slice(1) : 'User';
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      
      {sidebarOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}

      {/* --- Sidebar --- */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#ffffff] border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-20 flex items-center px-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#3ac47d]/10 p-2 rounded-xl text-[#3ac47d]">
               <ShieldCheck size={24} />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">EduPilot</span>
          </div>
          <button className="lg:hidden absolute right-4 text-gray-400 hover:text-gray-600" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Main Menu</p>
          {menuItems.map((item, index) => {
            const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`);
            return (
              <Link 
                key={index} 
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-medium text-[15px] ${
                  isActive 
                    ? "bg-[#3ac47d]/10 text-[#3ac47d]" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon size={18} className={isActive ? "text-[#3ac47d]" : "text-slate-400"} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f8fafc]">
        
        {/* --- Top Header --- */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-6 lg:px-8 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-500 hover:text-[#3ac47d] transition-colors p-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center bg-gray-50 rounded-2xl px-4 py-2.5 w-72 border border-gray-200 focus-within:border-[#3ac47d] focus-within:ring-2 focus-within:ring-[#3ac47d]/20 focus-within:bg-white transition-all">
              <Search size={16} className="text-gray-400" />
              <input type="text" placeholder="Search students, staff, etc..." className="bg-transparent border-none outline-none text-[14px] w-full ml-3 text-slate-700 placeholder-gray-400" />
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <button className="relative text-gray-400 hover:text-slate-700 transition-colors p-2 rounded-full hover:bg-gray-100">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            {/* --- Profile Dropdown --- */}
            <div className="relative border-l border-gray-200 pl-4 lg:pl-6" ref={profileMenuRef}>
              <button 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-3 focus:outline-none group"
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-slate-800 group-hover:text-[#3ac47d] transition-colors">{getDisplayRole(role)}</p>
                  <p className="text-xs text-slate-500 truncate max-w-[150px]">{user?.email}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#3ac47d] to-emerald-400 p-[2px] shadow-sm">
                   <div className="w-full h-full bg-white rounded-full flex items-center justify-center border-2 border-white overflow-hidden">
                     {user?.photoURL ? (
                       <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                     ) : (
                       <UserIcon size={18} className="text-[#3ac47d]" />
                     )}
                   </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 transform origin-top-right transition-all animate-fade-in-down">
                  <div className="px-4 py-3 border-b border-gray-50 md:hidden">
                    <p className="text-sm font-bold text-slate-800">{getDisplayRole(role)}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  
                  <Link href="/profile" onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    <UserIcon size={16} className="text-slate-400" />
                    My Profile
                  </Link>
                  <Link href="/settings" onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    <Settings size={16} className="text-slate-400" />
                    Account Settings
                  </Link>
                  
                  <div className="h-px bg-gray-100 my-1"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}
