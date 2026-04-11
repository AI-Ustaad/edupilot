"use client";
import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, GraduationCap, Layers, Users, 
  ClipboardCheck, Wallet, PenTool, Award, Clock, 
  ShieldCheck, Bell, Settings, LogOut, Repeat
} from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

// --- WRAPPER COMPONENT TO USE AUTH CONTEXT ---
function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth(); // Assuming you have a logout function in AuthContext
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const MENU_ITEMS = [
    { name: "Analytics", href: "/dashboard", icon: LayoutDashboard },
    { name: "Students", href: "/students", icon: GraduationCap },
    { name: "Classes", href: "/classes", icon: Layers },
    { name: "Staff", href: "/staff", icon: Users },
    { name: "Attendance", href: "/attendance", icon: ClipboardCheck },
    { name: "Fee Collection", href: "/fees", icon: Wallet },
    { name: "Exams & Marks", href: "/exams", icon: PenTool },
    { name: "Results", href: "/result", icon: Award },
    { name: "Time Table", href: "/timetable", icon: Clock },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      
      {/* --- LEFT SIDEBAR --- */}
      <aside className="w-[280px] bg-white border-r border-slate-100 flex flex-col hidden lg:flex shrink-0">
        <div className="h-20 flex items-center px-8 border-b border-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f0fdf4] rounded-xl flex items-center justify-center text-[#3ac47d]">
              <ShieldCheck size={24} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-black text-[#0F172A] tracking-tight">EduPilot</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <p className="px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Main Menu</p>
          <nav className="space-y-1.5">
            {MENU_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link key={item.name} href={item.href} className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${isActive ? "bg-[#f0fdf4] text-[#3ac47d]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 flex items-center justify-end px-8 shrink-0 print:hidden border-b border-slate-100 bg-white/50 backdrop-blur-sm z-50">
           <div className="flex items-center gap-4">
             <button className="text-slate-400 hover:text-slate-600 transition-colors">
               <Bell size={20} />
             </button>
             <div className="h-8 w-px bg-slate-200"></div>
             
             {/* --- PROFILE DROPDOWN MENU --- */}
             <div className="relative" ref={dropdownRef}>
               <div onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 px-3 py-2 rounded-2xl transition-all">
                 <div className="text-right hidden sm:block">
                   <p className="text-xs font-bold text-[#0F172A] group-hover:text-[#3ac47d] transition-colors">Principal / Admin</p>
                   <p className="text-[10px] text-slate-400">admin@edupilot.com</p>
                 </div>
                 <div className={`w-10 h-10 bg-slate-200 rounded-full border-2 shadow-sm overflow-hidden transition-all ${isProfileOpen ? "border-[#3ac47d] ring-2 ring-green-100" : "border-white"}`}>
                   <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" className="w-full h-full object-cover" />
                 </div>
               </div>

               {/* Dropdown Box */}
               {isProfileOpen && (
                 <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in-down">
                   <div className="p-2 space-y-1">
                     <Link href="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                       <Settings size={16} /> Admin Settings
                     </Link>
                     <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                       <Repeat size={16} /> Switch Role
                     </button>
                     <div className="h-px bg-slate-100 my-1"></div>
                     <button onClick={() => { setIsProfileOpen(false); /* logout(); */ }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                       <LogOut size={16} /> Sign Out
                     </button>
                   </div>
                 </div>
               )}
             </div>

           </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:px-8 sm:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// MAIN LAYOUT EXPORT
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/';

  if (isAuthPage) {
    return (
      <html lang="en">
        <body className={`${inter.className} bg-slate-50 text-slate-800`}>
          <AuthProvider>{children}</AuthProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-800`}>
        <AuthProvider>
           <DashboardLayout>{children}</DashboardLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
