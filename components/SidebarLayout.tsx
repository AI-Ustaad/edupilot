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
  TrendingUp, Film, Send, Star, PlusCircle,
} from "lucide-react";
import MobileBottomNav from "./MobileBottomNav";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/context/AuthContext";

// ✅ Direct imports to avoid server code leakage
import { PERMISSIONS } from "@/lib/auth/permissions";
import { hasAnyPermission } from "@/lib/auth/client-rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { user } = useAuth();
  const role = user?.role || "";

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
      key: null,
      items: [
        {
          name: t("commandCenter"),
          icon: LayoutDashboard,
          path: "/dashboard",
          permissions: [],
          allowed: ["superAdmin", "admin", "teacher", "accountant", "parent", "student"],
        },
      ],
    },
    {
      title: t("academic"),
      icon: BookOpen,
      key: "academic",
      items: [
        { name: t("students"), icon: Users, path: "/students", permissions: [PERMISSIONS.students.view] },
        { name: t("classes"), icon: GraduationCap, path: "/classes", permissions: [PERMISSIONS.settings.view] },
        { name: t("syllabus"), icon: FileText, path: "/admin/syllabus", permissions: [PERMISSIONS.lessonPlans.view, PERMISSIONS.settings.view] },
        { name: t("academicYear"), icon: Calendar, path: "/admin/academic-year", permissions: [PERMISSIONS.settings.view] },
        { name: t("videoLibrary"), icon: Film, path: "/video-lectures", permissions: [PERMISSIONS.videoLectures.view] },
      ],
    },
    {
      title: t("finance"),
      icon: DollarSign,
      key: "finance",
      items: [
        { name: t("fees"), icon: Wallet, path: "/fees", permissions: [PERMISSIONS.fees.view] }
      ],
    },
    {
      title: t("operations"),
      icon: Clock,
      key: "operations",
      items: [
        { name: t("attendance"), icon: ClipboardCheck, path: "/attendance", permissions: [PERMISSIONS.attendance.view] },
        { name: t("timetable"), icon: Clock, path: "/timetable", permissions: [PERMISSIONS.settings.view, PERMISSIONS.attendance.view] },
        { name: t("aiTimetable"), icon: Sparkles, path: "/ai-timetable", permissions: [PERMISSIONS.settings.view] },
        { name: t("buses"), icon: Bus, path: "/admin/buses", permissions: [PERMISSIONS.buses.view] },
      ],
    },
    {
      title: t("staff"),
      icon: UserCircle,
      key: "staff",
      items: [
        { name: t("staffManagement"), icon: UserCircle, path: "/staff", permissions: [PERMISSIONS.staff.view] },
        { name: t("parents"), icon: Heart, path: "/admin/parents", permissions: [PERMISSIONS.parents.view] },
        { name: t("leaveRequests"), icon: CalendarDays, path: "/leave-requests", permissions: [PERMISSIONS.staff.view] },
        { name: t("postHomework"), icon: FileText, path: "/teacher/homework", permissions: [PERMISSIONS.homework.view] },
        { name: t("assignments"), icon: FileText, path: "/teacher/assignments", permissions: [PERMISSIONS.assignments.view] },
        { name: t("quizzes"), icon: FileText, path: "/teacher/quizzes", permissions: [PERMISSIONS.quizzes.view] },
        { name: t("lessonPlans"), icon: Calendar, path: "/teacher/lesson-plans", permissions: [PERMISSIONS.lessonPlans.view] },
        { name: t("bookCenter"), icon: BookOpen, path: "/teacher/book-center", permissions: [PERMISSIONS.settings.view] },
        { name: t("manageBooks"), icon: FileText, path: "/teacher/manage-books", permissions: [PERMISSIONS.settings.view] },
        { name: t("examCenter"), icon: FileText, path: "/teacher/exam-center", permissions: [PERMISSIONS.quizzes.view] },
        { name: t("videoLectures"), icon: Film, path: "/teacher/video-lectures", permissions: [PERMISSIONS.videoLectures.create, PERMISSIONS.videoLectures.view] },
        { name: t("chat"), icon: Send, path: "/teacher/chat", permissions: [PERMISSIONS.chat.view] },
        { name: t("admissions"), icon: FileText, path: "/admin/admissions", permissions: [PERMISSIONS.students.create] },
        { name: t("addSkills"), icon: Star, path: "/teacher/skills", permissions: [PERMISSIONS.marks.view] },
        { name: t("behaviorPoints"), icon: PlusCircle, path: "/teacher/behavior", permissions: [PERMISSIONS.marks.view] },
      ],
    },
    {
      title: t("adminTools"),
      icon: Settings,
      key: "adminTools",
      items: [
        { name: t("settings"), icon: Settings, path: "/settings", permissions: [PERMISSIONS.settings.view] },
        { name: t("users"), icon: ShieldCheck, path: "/admin/users", permissions: [PERMISSIONS.settings.manage] },
        { name: t("auditLogs"), icon: FileText, path: "/admin/audit", permissions: [PERMISSIONS.audit.view] },
        { name: t("billing"), icon: CreditCard, path: "/settings/billing", permissions: [PERMISSIONS.subscriptions.view] },
      ],
    },
    {
      title: t("aiTools"),
      icon: Sparkles,
      key: "aiTools",
      items: [
        { name: t("aiAssistant"), icon: Bot, path: "/ai-chatbot", permissions: [PERMISSIONS.settings.view, PERMISSIONS.assignments.view] },
        { name: t("aiTimetable"), icon: Sparkles, path: "/ai-timetable", permissions: [PERMISSIONS.settings.view] },
        { name: t("examQuestions"), icon: FileText, path: "/ai-exam-questions", permissions: [PERMISSIONS.quizzes.view] },
      ],
    },
  ];

  const authorizedGroups = menuGroups.map(group => {
    const authorizedItems = group.items.filter((item: any) => {
      if (item.permissions && item.permissions.length > 0) {
        return hasAnyPermission(role, item.permissions);
      }
      if (item.allowed) {
        return item.allowed.includes(role);
      }
      return true;
    });

    return { ...group, items: authorizedItems };
  }).filter(group => group.items.length > 0);

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
          {!role || role === "loading" ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-100 rounded w-full"></div>
              <div className="h-8 bg-gray-100 rounded w-full"></div>
              <div className="h-8 bg-gray-100 rounded w-full"></div>
            </div>
          ) : (
            authorizedGroups.map((group) => (
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
                    {group.items.map((item) => {
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
