"use client";
import React from "react";
import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Users, UserCheck, ClipboardCheck, 
  BookOpen, CreditCard, Settings, GraduationCap, LogOut 
} from "lucide-react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login" || pathname === "/";

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20}/> },
    { name: 'Students', path: '/students', icon: <Users size={20}/> },
    { name: 'Teachers', path: '/staff', icon: <UserCheck size={20}/> },
    { name: 'Attendance', path: '/attendance', icon: <ClipboardCheck size={20}/> },
    { name: 'Exam', path: '/marks', icon: <BookOpen size={20}/> },
    { name: 'Account', path: '/fees', icon: <CreditCard size={20}/> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20}/> }
  ];

  if (isLoginPage) return <html lang="en"><body>{children}</body></html>;

  return (
    <html lang="en">
      <body className="bg-[#F8F9FE] flex h-screen overflow-hidden font-sans">
        {/* SHARED ELITE SIDEBAR */}
        <aside className="w-72 bg-[#302B52] text-white flex flex-col p-8 rounded-r-[48px] shadow-2xl z-50">
          <div className="flex items-center gap-4 mb-12 px-2">
            <div className="bg-white p-2 rounded-xl text-[#302B52] shadow-lg"><GraduationCap size={24} /></div>
            <span className="text-2xl font-black tracking-tight">EduPilot</span>
          </div>
          
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <Link href={item.path} key={item.name}>
                <div className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${
                  pathname === item.path ? 'bg-white/15 border-l-4 border-[#7166F9] shadow-inner' : 'hover:bg-white/5 opacity-60 hover:opacity-100'
                }`}>
                  {item.icon}
                  <span className="font-bold">{item.name}</span>
                </div>
              </Link>
            ))}
          </nav>

          <div className="pt-8 border-t border-white/10 mt-auto">
            <div className="flex items-center gap-3 p-4 opacity-60 hover:opacity-100 cursor-pointer text-red-300">
              <LogOut size={20} /> <span className="font-bold">Logout</span>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-[#F8F9FE]">
          {children}
        </main>
      </body>
    </html>
  );
}
