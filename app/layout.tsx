"use client";
import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthProvider } from './context/AuthContext';
import { 
  LayoutDashboard, GraduationCap, Layers, Users, 
  ClipboardCheck, Wallet, PenTool, Award, Settings, 
  ShieldCheck, Bell
} from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();

  // اگر یوزر لاگ ان پیج پر ہے تو سائیڈ بار نہیں دکھانی
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/';

  if (isAuthPage) {
    return (
      <html lang="en">
        <body className={`${inter.className} bg-slate-50 text-slate-800`}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </body>
      </html>
    );
  }

  // --- SMART MENU ARRAY ---
  // یہاں "Classes" کو Students کے فوراً بعد شامل کر دیا گیا ہے
  const MENU_ITEMS = [
    { name: "Analytics", href: "/dashboard", icon: LayoutDashboard },
    { name: "Students", href: "/students", icon: GraduationCap },
    { name: "Classes", href: "/classes", icon: Layers }, // <-- NEW ADDED HERE
    { name: "Staff", href: "/staff", icon: Users },
    { name: "Attendance", href: "/attendance", icon: ClipboardCheck },
    { name: "Fee Collection", href: "/fees", icon: Wallet },
    { name: "Exams & Marks", href: "/exams", icon: PenTool },
    { name: "Results", href: "/result", icon: Award },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-800`}>
        <AuthProvider>
          <div className="flex h-screen overflow-hidden bg-slate-50">
            
            {/* --- LEFT SIDEBAR (White Background) --- */}
            <aside className="w-[280px] bg-white border-r border-slate-100 flex flex-col hidden lg:flex shrink-0">
              
              {/* Logo Area */}
              <div className="h-20 flex items-center px-8 border-b border-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#f0fdf4] rounded-xl flex items-center justify-center text-[#3ac47d]">
                    <ShieldCheck size={24} strokeWidth={2.5} />
                  </div>
                  <span className="text-xl font-black text-[#0F172A] tracking-tight">EduPilot</span>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto py-6 px-4">
                <p className="px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Main Menu</p>
                <nav className="space-y-1.5">
                  {MENU_ITEMS.map((item) => {
                    // Check if current path matches the link
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    
                    return (
                      <Link 
                        key={item.name} 
                        href={item.href}
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${
                          isActive 
                            ? "bg-[#f0fdf4] text-[#3ac47d]" // Active state (Green)
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700" // Inactive state
                        }`}
                      >
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
              
              {/* Topbar (Optional: if you want a global topbar for mobile menu or notifications) */}
              <header className="h-20 flex items-center justify-end px-8 shrink-0 print:hidden">
                 <div className="flex items-center gap-4">
                   <button className="text-slate-400 hover:text-slate-600 transition-colors">
                     <Bell size={20} />
                   </button>
                   <div className="h-8 w-px bg-slate-200"></div>
                   <div className="flex items-center gap-3 cursor-pointer">
                     <div className="text-right hidden sm:block">
                       <p className="text-xs font-bold text-[#0F172A]">Principal / Admin</p>
                       <p className="text-[10px] text-slate-400">admin@edupilot.com</p>
                     </div>
                     <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden">
                       {/* You can load actual profile image here */}
                       <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" className="w-full h-full object-cover" />
                     </div>
                   </div>
                 </div>
              </header>

              {/* Dynamic Page Content */}
              <main className="flex-1 overflow-y-auto p-4 sm:px-8 sm:pb-8">
                {children}
              </main>
              
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
