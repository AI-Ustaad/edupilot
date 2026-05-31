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
  Film, Send, Star, PlusCircle, Loader2
} from "lucide-react";
import MobileBottomNav from "./MobileBottomNav";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/context/AuthContext";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { user, loading } = useAuth();
  // ڈیفالٹ رول تاکہ کمپوننٹ کریش نہ ہو
  const role = user?.role || "teacher";

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    academic: true,
    finance: true,
    adminTools: true,
    operations: true,
    staff: true,
    aiTools: true,
  });

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
    {
      title: t("academic"),
      icon: BookOpen,
      items: [
        { name: t("students"), icon: Users, path: "/students", allowed: ["admin", "teacher"] },
        { name: t("classes"), icon: GraduationCap, path: "/classes", allowed: ["admin"] },
        { name: t("syllabus"), icon: FileText, path: "/admin/syllabus", allowed: ["admin"] },
        { name: t("academicYear"), icon: Calendar, path: "/admin/academic-year", allowed: ["admin"] },
        { name: t("videoLibrary"), icon: Film, path: "/video-lectures", allowed: ["admin", "teacher", "parent"] },
      ],
      allowed: ["admin", "teacher", "parent"],
      key: "academic",
    },
    {
      title: t("finance"),
      icon: DollarSign,
      items: [
        { name: t("fees"), icon: Wallet, path: "/fees", allowed: ["admin", "accountant"] },
        { name: t("ledger"), icon: ClipboardCheck, path: "/ledger", allowed: ["admin", "accountant"] },
      ],
      allowed: ["admin", "accountant"],
      key: "finance",
    },
    {
      title: t("operations"),
      icon: Clock,
      items: [
        { name: t("attendance"), icon: ClipboardCheck, path: "/attendance", allowed: ["admin", "teacher"] },
        { name: t("timetable"), icon: Clock, path: "/timetable", allowed: ["admin", "teacher"] },
        { name: t("aiTimetable"), icon: Sparkles, path: "/ai-timetable", allowed: ["admin", "teacher"] },
        { name: t("buses"), icon: Bus, path: "/admin/buses", allowed: ["admin"] },
      ],
      allowed: ["admin", "teacher"],
      key: "operations",
    },
    {
      title: t("staff"),
      icon: UserCircle,
      items: [
        { name: t("staffManagement"), icon: UserCircle, path: "/staff", allowed: ["admin"] },
        { name: t("parents"), icon: Heart, path: "/admin/parents", allowed: ["admin"] },
        { name: t("leaveRequests"), icon: CalendarDays, path: "/leave-requests", allowed: ["admin"] },
        { name: t("postHomework"), icon: FileText, path: "/teacher/homework", allowed: ["admin", "teacher"] },
        { name: t("assignments"), icon: FileText, path: "/teacher/assignments", allowed: ["admin", "teacher"] },
        { name: t("quizzes"), icon: FileText, path: "/teacher/quizzes", allowed: ["admin", "teacher"] },
        { name: t("lessonPlans"), icon: Calendar, path: "/teacher/lesson-plans", allowed: ["admin", "teacher"] },
        { name: t("bookCenter"), icon: BookOpen, path: "/teacher/book-center", allowed: ["admin", "teacher"] },
        { name: t("manageBooks"), icon: FileText, path: "/teacher/manage-books", allowed: ["admin", "teacher"] },
        { name: t("examCenter"), icon: FileText, path: "/teacher/exam-center", allowed: ["admin", "teacher"] },
        { name: t("videoLectures"), icon: Film, path: "/teacher/video-lectures", allowed: ["admin", "teacher"] },
        { name: t("chat"), icon: Send, path: "/teacher/chat", allowed: ["admin", "teacher"] },
        { name: t("admissions"), icon: FileText, path: "/admin/admissions", allowed: ["admin"] },
        { name: t("addSkills"), icon: Star, path: "/teacher/skills", allowed: ["admin", "teacher"] },
        { name: t("behaviorPoints"), icon: PlusCircle, path: "/teacher/behavior", allowed: ["admin", "teacher"] },
      ],
      allowed: ["admin"],
      key: "staff",
    },
    {
      title: t("adminTools"),
      icon: Settings,
      items: [
        { name: t("settings"), icon: Settings, path: "/settings", allowed: ["admin"] },
        { name: t("users"), icon: ShieldCheck, path: "/admin/users", allowed: ["admin"] },
        { name: t("auditLogs"), icon: FileText, path: "/admin/audit", allowed: ["admin"] },
        { name: t("billing"), icon: CreditCard, path: "/settings/billing", allowed: ["admin"] },
      ],
      allowed: ["admin"],
      key: "adminTools",
    },
    {
      title: t("aiTools"),
      icon: Sparkles,
      items: [
        { name: t("aiAssistant"), icon: Bot, path: "/ai-chatbot", allowed: ["admin", "teacher"] },
        { name: t("examQuestions"), icon: FileText, path: "/ai-exam-questions", allowed: ["admin", "teacher"] },
      ],
      allowed: ["admin", "teacher"],
      key: "aiTools",
    },
  ];

  const visibleGroups = menuGroups.filter((g) => g.allowed.includes(role));

  const handleLogout = async () => {
    await signOut(auth);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen bg-white">
      <button
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
      </button>

      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 flex flex-col transform transition-transform md:relative md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } bg-white border-r border-gray-200`}
      >
        <div
          className="h-20 px-6 border-b border-gray-200 flex items-center gap-2 cursor-pointer shrink-0"
          onClick={() => router.push("/dashboard")}
        >
          <ShieldCheck className="text-blue-600 w-8 h-8" />
          <span className="text-xl font-black text-gray-900">EduPilot</span>
        </div>

        <div className="px-4 py-3 border-b border-gray-100 shrink-0">
          <LanguageSwitcher />
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-4 custom-scrollbar">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
               <Loader2 className="animate-spin" size={24} />
               <span className="text-sm font-medium">{t("loading")}</span>
             </div>
          ) : (
            visibleGroups.map((group) => (
              <div key={group.title} className="mb-2">
                <div
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => group.key && toggleGroup(group.key)}
                >
                  <div className="flex items-center gap-2">
                    <group.icon size={18} className="text-blue-600" />
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
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            <item.icon size={18} />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-200 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">{t("logout")}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">{children}</div>
        <MobileBottomNav />
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </div>
  );
}
