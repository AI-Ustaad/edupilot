"use client";

import { useState, useEffect } from "react";
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
  // add any other icons used in DEFAULT_MENU
} from "lucide-react";
import MobileBottomNav from "./MobileBottomNav";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/context/AuthContext";
import { MenuService } from "@/services/menu.service";
import { MenuGroup } from "@/types/menu";
import { ROLE_PERMISSIONS } from "@/lib/auth/permissions";

// Map icon strings to Lucide components
const iconMap: Record<string, React.ComponentType<any>> = {
  LayoutDashboard,
  Users,
  BookOpen,
  UserCircle,
  ClipboardCheck,
  Wallet,
  Clock,
  Settings,
  ShieldCheck,
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
  Menu,
  X,
  LogOut,
};

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, loading } = useAuth();
  const role = user?.role || "teacher";

  const [menu, setMenu] = useState<MenuGroup[]>([]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (loading || !user) return;

    const menuService = new MenuService();
    // For now, pass all permissions allowed for the role. Later, you can fetch actual permissions from a server.
    const permissions = ROLE_PERMISSIONS[role] || [];
    // disabledFeatures can come from a context/API – for now empty array
    const disabledFeatures: string[] = [];

    const filteredMenu = menuService.getMenuForUser(role, permissions, disabledFeatures);
    setMenu(filteredMenu);

    // Initialize openGroups based on the keys that exist
    const initialOpen: Record<string, boolean> = {};
    filteredMenu.forEach(group => {
      if (group.key) {
        initialOpen[group.key] = true; // default open
      }
    });
    setOpenGroups(initialOpen);
  }, [user, loading, role]);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = async () => {
    await signOut(auth);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  // Map translated title from the key stored in config (e.g., t("commandCenter"))
  const getTitle = (group: MenuGroup) => {
    // Translation keys are stored in the title field (e.g., "commandCenter")
    return t(group.title as any) || group.title;
  };

  const getItemName = (item: any) => {
    return t(item.name as any) || item.name;
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
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
              <Loader2 className="animate-spin" size={24} />
              <span className="text-sm">Loading Menu...</span>
            </div>
          ) : (
            menu.map((group) => {
              const GroupIcon = iconMap[group.icon] || BookOpen;
              return (
                <div key={group.title} className="mb-2">
                  <div
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => group.key && toggleGroup(group.key)}
                  >
                    <div className="flex items-center gap-2">
                      <GroupIcon size={18} className="text-blue-600" />
                      <span className="text-sm font-semibold">{getTitle(group)}</span>
                    </div>
                    {group.key && (openGroups[group.key] ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                  </div>

                  {(!group.key || openGroups[group.key]) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {group.children.map((item) => {
                        const ItemIcon = iconMap[item.icon] || FileText;
                        const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
                        return (
                          <Link
                            key={item.name}
                            href={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                              isActive
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            <ItemIcon size={18} />
                            <span>{getItemName(item)}</span>
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
