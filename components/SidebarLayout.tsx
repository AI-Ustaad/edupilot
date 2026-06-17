"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Menu, X, LogOut, ChevronDown, ChevronRight } from "lucide-react";
import MobileBottomNav from "./MobileBottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/context/AuthContext";
import { hasAnyPermission } from "@/lib/auth/client-rbac";
import { DEFAULT_MENU } from "@/services/menu.service"; // 🚀 نیا امپورٹ

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { user } = useAuth();
  const role = user?.role || "superAdmin"; // 🛡️ لوڈنگ کے دوران غائب ہونے سے بچنے کے لیے

  // تمام گروپس کو بائی ڈیفالٹ اوپن رکھا گیا ہے
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    DEFAULT_MENU.forEach(m => initial[m.title] = true);
    return initial;
  });

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  // 🚀 Dynamic Filtering Logic based on DEFAULT_MENU
  const filteredMenuGroups = useMemo(() => {
    return DEFAULT_MENU.map((group) => {
      // 1. اگر گروپ کے اندر ڈائریکٹ لنک ہے (جیسے Dashboard)
      if (!group.children && group.href) {
        const canView = role === "superAdmin" || (group.permission && hasAnyPermission(role, [group.permission as any]));
        return canView ? group : null;
      }

      // 2. اگر گروپ کے اندر Children (sub-menus) ہیں
      if (group.children) {
        const filteredChildren = group.children.filter((child) => {
          if (role === "superAdmin") return true;
          if (child.permission) return hasAnyPermission(role, [child.permission as any]);
          return false;
        });

        // اگر پرمیشن کے بعد کوئی ایک بھی child بچ گیا ہے، تو گروپ دکھائیں
        if (filteredChildren.length > 0) {
          return { ...group, children: filteredChildren };
        }
      }
      return null;
    }).filter(Boolean); // null والی ویلیوز نکال دیں
  }, [role]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* 🖥️ Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-50 border-r">
        <div className="h-16 flex items-center justify-center border-b shrink-0">
           <h1 className="text-xl font-bold text-blue-600 tracking-tight">EduPilot</h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 sidebar-scrollbar">
          {filteredMenuGroups.map((group: any, index: number) => (
            <div key={index} className="mb-4">
              
              {/* Group Title (If it has children) */}
              {group.children ? (
                <button 
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <group.icon className="w-4 h-4" />
                    <span>{group.title}</span>
                  </div>
                  {openGroups[group.title] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              ) : (
                /* Direct Link (Like Dashboard) */
                <Link
                  href={group.href}
                  className={`flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-all duration-200 ${
                    pathname === group.href ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <group.icon className={`w-4 h-4 ${pathname === group.href ? 'text-blue-600' : 'text-gray-400'}`} />
                  {group.title}
                </Link>
              )}

              {/* Sub-menu Items */}
              {group.children && openGroups[group.title] && (
                <div className="mt-1 space-y-1">
                  {group.children.map((child: any, childIndex: number) => {
                    const isActive = pathname === child.href || pathname.startsWith(`${child.href}/`);
                    return (
                      <Link
                        key={childIndex}
                        href={child.href}
                        className={`flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-all duration-200 ${
                          isActive 
                            ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600" 
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <child.icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                        {child.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t shrink-0 bg-gray-50">
          <LanguageSwitcher />
          <button 
            onClick={handleLogout}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors border border-transparent hover:border-red-100"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* 📱 Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col bg-gray-50/50">
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b shrink-0">
           <h1 className="text-xl font-bold text-blue-600">EduPilot</h1>
           <button 
             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
             className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
            >
             {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
           </button>
        </div>
        
        <div className="p-4 md:p-8 flex-1">
          {children}
        </div>
      </main>

      {/* 📱 Mobile Navigation (Bottom Bar) */}
      <div className="md:hidden shrink-0">
        <MobileBottomNav />
      </div>
    </div>
  );
}
