"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  LayoutDashboard, Users, BookOpen, UserCircle, ClipboardCheck,
  Wallet, Clock, Settings, Menu, X, ShieldCheck, LogOut,
  GraduationCap, DollarSign, Calendar, FileText, Heart,
  ChevronDown, ChevronRight, CreditCard, Sparkles, Bus, CalendarDays, Bot,
  Film, Send, Star, PlusCircle, Loader2
} from "lucide-react";
import MobileBottomNav from "./MobileBottomNav";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/context/AuthContext";
import { MenuService } from "@/services/menu.service";
import { MenuGroup } from "@/types/menu";

// آئیکن نام سے اصلی کمپوننٹ کی میپنگ
const iconMap: Record<string, React.ComponentType<any>> = {
  LayoutDashboard,
  Users,
  BookOpen,
  UserCircle,
  ClipboardCheck,
  Wallet,
  Clock,
  Settings,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  GraduationCap,
  DollarSign,
  Calendar,
  FileText,
  Heart,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Sparkles,
  Bus,
  CalendarDays,
  Bot,
  Film,
  Send,
  Star,
  PlusCircle,
};

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, loading } = useAuth();
  const role = user?.role || "teacher";

  const [menuGroups, setMenuGroups] = useState<MenuGroup[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    academic: true,
    finance: true,
    adminTools: true,
    operations: true,
    staff: true,
    aiTools: true,
  });

  // ڈائنامک مینو حاصل کریں
  useEffect(() => {
    if (loading) return; // auth کا انتظار کریں
    const service = new MenuService();
    service
      .getMenuForUser(role)
      .then((groups) => setMenuGroups(groups))
      .finally(() => setMenuLoading(false));
  }, [role, loading]);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = async () => {
    await signOut(auth);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 flex flex-col transform transition-transform md:relative md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } bg-white border-r border-gray-200`}
      >
        {/* Logo */}
        <div
          className="h-20 px-6 border-b border-gray-200 flex items-center gap-2 cursor-pointer shrink-0"
          onClick={() => router.push("/dashboard")}
        >
          <ShieldCheck className="text-blue-600 w-8 h-8" />
          <span className="text-xl font-black text-gray-900">EduPilot</span>
        </div>

        {/* Language Switcher */}
        <div className="px-4 py-3 border-b border-gray-100 shrink-0">
          <LanguageSwitcher />
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-2 px-4 custom-scrollbar">
          {menuLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
              <Loader2 className="animate-spin" size={24} />
              <span className="text-sm">Loading Menu...</span>
            </div>
          ) : menuGroups.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">No menu items available</div>
          ) : (
            menuGroups.map((group) => {
              const groupKey = group.labelKey; // e.g., "commandCenter"
              const IconComponent = iconMap[group.icon] || FileText;
              const isOpen = openGroups[groupKey] !== false; // default open

              return (
                <div key={groupKey} className="mb-2">
                  <div
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => group.children.length > 1 && toggleGroup(groupKey)}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent size={18} className="text-blue-600" />
                      <span className="text-sm font-semibold">{t(group.labelKey)}</span>
                    </div>
                    {group.children.length > 1 && (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                  </div>

                  {isOpen && (
                    <div className="ml-6 mt-1 space-y-1">
                      {group.children.map((item) => {
                        const ItemIcon = iconMap[item.icon] || FileText;
                        const isActive = item.path
                          ? pathname === item.path || pathname.startsWith(item.path + "/")
                          : false;

                        if (item.path) {
                          return (
                            <Link
                              key={item.labelKey}
                              href={item.path}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                                isActive
                                  ? "bg-blue-600 text-white shadow-sm"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              <ItemIcon size={18} />
                              <span>{t(item.labelKey)}</span>
                            </Link>
                          );
                        } else {
                          // اگر صرف گروپ ہیڈر ہو (غیر معمولی)
                          return (
                            <div key={item.labelKey} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500">
                              <ItemIcon size={18} />
                              <span>{t(item.labelKey)}</span>
                            </div>
                          );
                        }
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Logout */}
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

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">{children}</div>
        <MobileBottomNav />
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </div>
  );
}
