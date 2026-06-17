"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  LayoutDashboard, Users, BookOpen, UserCircle,
  Wallet, Clock, Settings, Menu, X, LogOut,
  GraduationCap, DollarSign, CreditCard, Sparkles, Bus, CalendarDays, Bot,
  ChevronDown, ChevronRight,
} from "lucide-react";
import MobileBottomNav from "./MobileBottomNav";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/context/AuthContext";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { hasAnyPermission } from "@/lib/auth/client-rbac";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { user } = useAuth();
  
  // 🛡️ Default to superAdmin during loading to prevent empty flashes
  const role = user?.role || "superAdmin"; 

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    academic: true, finance: true, adminTools: true, operations: true, staff: true, aiTools: true,
  });

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 🛡️ رول اور پرمیشن کی بنیاد پر ڈائنیمک فلٹرنگ
  const filteredMenuGroups = useMemo(() => {
    const groups: any[] = [
      {
        title: t("commandCenter", { fallback: "Command Center" }),
        icon: LayoutDashboard,
        key: null,
        items: [
          { name: t("dashboard", { fallback: "Dashboard" }), icon: LayoutDashboard, path: "/dashboard", allowed: ["superAdmin", "admin", "teacher", "accountant", "parent", "student"] },
        ],
      },
      {
        title: t("academic", { fallback: "Academic" }),
        icon: BookOpen,
        key: "academic",
        items: [
          { name: t("students", { fallback: "Students" }), icon: Users, path: "/students", permissions: [PERMISSIONS.students?.view || "students.view"] },
          { name: t("classes", { fallback: "Classes" }), icon: GraduationCap, path: "/classes", permissions: [PERMISSIONS.settings?.view || "settings.view"] },
          { name: t("attendance", { fallback: "Attendance" }), icon: Clock, path: "/attendance", permissions: [PERMISSIONS.attendance?.view || "attendance.view"] },
        ],
      },
      {
        title: t("finance", { fallback: "Finance" }),
        icon: Wallet,
        key: "finance",
        items: [
          { name: t("fees", { fallback: "Fee Collection" }), icon: DollarSign, path: "/fees", permissions: [PERMISSIONS.finance?.view || "finance.view"] },
          { name: t("expenses", { fallback: "Expenses" }), icon: CreditCard, path: "/expenses", permissions: [PERMISSIONS.finance?.view || "finance.view"] },
        ],
      },
      {
        title: t("staff", { fallback: "Staff & HR" }),
        icon: UserCircle,
        key: "staff",
        items: [
          { name: t("staffDirectory", { fallback: "Staff Directory" }), icon: Users, path: "/staff", permissions: [PERMISSIONS.staff?.view || "staff.view"] },
        ],
      },
      {
        title: t("operations", { fallback: "Operations" }),
        icon: Bus,
        key: "operations",
        items: [
          { name: t("transport", { fallback: "Transport" }), icon: Bus, path: "/transport", permissions: [PERMISSIONS.settings?.view || "settings.view"] },
          { name: t("events", { fallback: "Events" }), icon: CalendarDays, path: "/events", allowed: ["superAdmin", "admin", "teacher"] },
        ],
      },
      {
        title: t("aiTools", { fallback: "AI Tools" }),
        icon: Sparkles,
        key: "aiTools",
        items: [
          { name: t("aiInsights", { fallback: "AI Insights" }), icon: Bot, path: "/ai-insights", allowed: ["superAdmin", "admin", "principal"] },
        ],
      },
      {
        title: t("adminTools", { fallback: "Admin Tools" }),
        icon: Settings,
        key: "adminTools",
        items: [
          { name: t("settings", { fallback: "Settings" }), icon: Settings, path: "/settings", permissions: [PERMISSIONS.settings?.view || "settings.view"] },
        ],
      }
    ];

    return groups
      .map((group) => {
        const filteredItems = group.items.filter((item: any) => {
          if (role === "superAdmin") return true;
          if (item.allowed && item.allowed.includes(role)) return true;
          
          if (item.permissions && item.permissions.length > 0) {
            return hasAnyPermission(role, item.permissions);
          }
          
          return false;
        });

        return { ...group, items: filteredItems };
      })
      .filter((group) => group.items.length > 0);
  }, [role, t]);

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
           <h1 className="text-xl font-bold text-gray-800">EduPilot</h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {filteredMenuGroups.map((group, index) => (
            <div key={index} className="mb-4">
              {group.key && (
                <button 
                  onClick={() => toggleGroup(group.key as string)}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <group.icon className="w-4 h-4" />
                    <span>{group.title}</span>
                  </div>
                  {openGroups[group.key] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              )}

              {(!group.key || openGroups[group.key]) && (
                <div className="mt-1">
                  {group.items.map((item: any, itemIndex: number) => {
                    const isActive = pathname === item.path;
                    return (
                      <Link
                        key={itemIndex}
                        href={item.path}
                        className={`flex items-center gap-3 px-8 py-2 text-sm ${
                          isActive ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600" : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t shrink-0">
          <LanguageSwitcher />
          <button 
            onClick={handleLogout}
            className="mt-4 w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
          >
            <LogOut className="w-4 h-4" />
            {t("logout", { fallback: "Logout" })}
          </button>
        </div>
      </aside>

      {/* 📱 Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <div className="md:hidden flex items-center justify-between p-4 border-b shrink-0">
           <h1 className="text-xl font-bold text-gray-800">EduPilot</h1>
           <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
           </button>
        </div>
        
        <div className="p-4 md:p-8 flex-1">
          {children}
        </div>
      </main>

      {/* 📱 Mobile Navigation */}
      <div className="md:hidden shrink-0">
        <MobileBottomNav />
      </div>
    </div>
  );
}
