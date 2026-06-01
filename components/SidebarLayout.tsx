"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  LayoutDashboard, Users, BookOpen, UserCircle, ClipboardCheck,
  Wallet, Clock, Settings, Menu, X, ShieldCheck, LogOut,
  GraduationCap, DollarSign, Calendar, FileText, Heart,
  ChevronDown, ChevronRight, CreditCard, Sparkles, Bus, CalendarDays, Bot,
  Film, Send, Star, PlusCircle, Loader2,
} from "lucide-react";
import MobileBottomNav from "./MobileBottomNav";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/context/AuthContext";
import { useBranding } from "@/context/BrandingContext"; // 👈 نیا

// آئیکون میپنگ
const iconMap: Record<string, React.ComponentType<any>> = {
  LayoutDashboard, Users, BookOpen, UserCircle, ClipboardCheck,
  Wallet, Clock, Settings, ShieldCheck, LogOut, GraduationCap,
  DollarSign, Calendar, FileText, Heart, ChevronDown, ChevronRight,
  CreditCard, Sparkles, Bus, CalendarDays, Bot, Film, Send, Star, PlusCircle,
  Menu, X,
};

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, loading } = useAuth();
  const role = user?.role || "teacher";
  const branding = useBranding(); // 👈 برانڈنگ ڈیٹا

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    academic: true, finance: true, adminTools: true,
    operations: true, staff: true, aiTools: true,
  });

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // مینو گروپس (پہلے کی طرح)
  const menuGroups = [
    {
      title: t("commandCenter"),
      icon: LayoutDashboard,
      items: [
        { name: t("commandCenter"), icon: LayoutDashboard, path: "/dashboard", allowed: ["admin", "teacher", "accountant"] },
      ],
      allowed: ["admin", "teacher", "accountant"],
      key: null,
    },
    // ... (باقی تمام گروپس بالکل ویسے ہی جیسے پہلے تھے)
  ];

  const visibleGroups = menuGroups.filter((g) => g.allowed.includes(role));

  const handleLogout = async () => {
    await signOut(auth);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen bg-white">
      {/* موبائل مینو بٹن */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* سائڈبار */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 flex flex-col transform transition-transform md:relative md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } bg-white border-r border-gray-200`}
      >
        {/* 👇 برانڈڈ لوگو / نام */}
        <div
          className="h-20 px-6 border-b border-gray-200 flex items-center gap-2 cursor-pointer shrink-0"
          onClick={() => router.push("/dashboard")}
        >
          {branding.logo ? (
            <img
              src={branding.logo}
              alt="Logo"
              className="w-8 h-8 object-contain rounded"
            />
          ) : (
            <ShieldCheck className="text-blue-600 w-8 h-8" />
          )}
          <span className="text-xl font-black text-gray-900">
            {branding.schoolName || "EduPilot"}
          </span>
        </div>

        {/* زبان بدلنے والا */}
        <div className="px-4 py-3 border-b border-gray-100 shrink-0">
          <LanguageSwitcher />
        </div>

        {/* نیویگیشن */}
        <div className="flex-1 overflow-y-auto py-2 px-4 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
              <Loader2 className="animate-spin" size={24} />
              <span className="text-sm">Loading Menu...</span>
            </div>
          ) : (
            visibleGroups.map((group) => {
              const GroupIcon = iconMap[group.icon] || BookOpen;
              return (
                <div key={group.title} className="mb-2">
                  <div
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => group.key && toggleGroup(group.key)}
                  >
                    <div className="flex items-center gap-2">
                      <GroupIcon size={18} className="text-blue-600" />
                      <span className="text-sm font-semibold">{group.title}</span>
                    </div>
                    {group.key && (openGroups[group.key] ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                  </div>

                  {(!group.key || openGroups[group.key]) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {group.items
                        .filter((i) => i.allowed.includes(role))
                        .map((item) => {
                          const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
                          return (
                            <Link
                              key={item.name}
                              href={item.path}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                                isActive
                                  ? "text-white shadow-sm"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                              style={
                                isActive
                                  ? { backgroundColor: branding.primaryColor || "#3b82f6" }
                                  : {}
                              }
                            >
                              <item.icon size={18} />
                              <span>{item.name}</span>
                            </Link>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* لاگ آؤٹ */}
        <div className="p-4 border-t border-gray-200 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Secure Logout</span>
          </button>
        </div>
      </div>

      {/* مرکزی مواد */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">{children}</div>
        <MobileBottomNav />
      </div>

      {/* موبائل اوورلے */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </div>
  );
}
