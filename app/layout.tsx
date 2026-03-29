"use client";
import React from "react";
import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Users, UserCheck, ClipboardCheck, 
  BookOpen, CreditCard, Settings, GraduationCap, LogOut, Wallet
} from "lucide-react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login" || pathname === "/";

  if (isLoginPage) return <html lang="en"><body>{children}</body></html>;

  const sections = [
    {
      title: "OVERVIEW",
      items: [{ name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18}/> }]
    },
    {
      title: "ACADEMICS",
      items: [
        { name: 'Students', path: '/students', icon: <Users size={18}/> },
        { name: 'Attendance', path: '/attendance', icon: <ClipboardCheck size={18}/> },
        { name: 'Exams', path: '/marks', icon: <BookOpen size={18}/> }
      ]
    },
    {
      title: "FINANCE",
      items: [
        { name: 'Fee Portal', path: '/fees', icon: <CreditCard size={18}/> },
        { name: 'Accounts', path: '/accounts', icon: <Wallet size={18}/> }
      ]
    },
    {
      title: "MANAGEMENT",
      items: [
        { name: 'Teachers', path: '/staff', icon: <UserCheck size={18}/> },
        { name: 'Settings', path: '/settings', icon: <Settings size={18}/> }
      ]
    }
  ];

  return (
    <html lang="en">
      <body className="bg-[#F8F9FE] flex h-screen overflow-hidden font-sans">
        <aside className="w-72 bg-[#302B52] text-white flex flex-col p-6 rounded-r-[40px] shadow-2xl z-50 overflow-y-auto">
          <div className="flex items-center gap-3 mb-10 px-4">
            <div className="bg-white p-2 rounded-xl text-[#302B52]"><GraduationCap size={24} /></div>
            <span className="text-xl font-black tracking-tight uppercase">EduPilot</span>
          </div>
          
          <nav className="flex-1 space-y-8">
            {sections.map((section) => (
              <div key={section.title}>
                <p className="px-4 text-[10px] font-black text-white/30 tracking-[3px] mb-4 uppercase">{section.title}</p>
                {section.items.map((item) => (
                  <Link href={item.path} key={item.name}>
                    <div className={`flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all mb-1 ${
                      pathname === item.path ? 'bg-[#7166F9] shadow-lg shadow-purple-900/20' : 'hover:bg-white/5 opacity-60 hover:opacity-100'
                    }`}>
                      {item.icon}
                      <span className="text-sm font-bold">{item.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          <div className="pt-6 border-t border-white/10 mt-6">
            <div className="flex items-center gap-3 px-4 py-2 opacity-50 hover:opacity-100 cursor-pointer text-red-300 transition-all">
              <LogOut size={18} /> <span className="text-sm font-bold">Logout Securely</span>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}
