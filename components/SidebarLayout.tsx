"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  Menu, X, LogOut, ShieldCheck, ChevronDown, ChevronRight,
  LayoutDashboard, BarChart3, FileText, Users, UserCircle,
  GraduationCap, BookOpen, Clock, Award, ClipboardCheck,
  HelpCircle, Wallet, DollarSign, Bus, Sparkles, Settings,
  Flag, ScrollText, Palette, Heart, PlusCircle, Calendar,
  Eye, TrendingUp, CreditCard, Package, Link2, Bookmark,
  FileSpreadsheet, UserCheck, UserPlus, Library, Route,
  Bot, FileQuestion, BrainCircuit, School, Activity, Briefcase,
  ArrowUpDown, Shield, PaintBucket, Globe,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROLE_PERMISSIONS } from "@/lib/auth/roles";

// ─── مینو ڈھانچہ (گروپس + ذیلی آئٹمز) ──────────────
const MENU_GROUPS = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    key: "dashboard",
    items: [
      { name: "Overview", icon: LayoutDashboard, path: "/dashboard", permission: "analytics.view" },
      { name: "Analytics", icon: TrendingUp, path: "/admin/analytics", permission: "analytics.view" },
      { name: "Reports", icon: FileText, path: "/reports", permission: "analytics.view" },
    ],
  },
  {
    title: "Students",
    icon: Users,
    key: "students",
    items: [
      { name: "All Students", icon: Users, path: "/students", permission: "students.view" },
      { name: "Add Student", icon: UserPlus, path: "/students/add", permission: "students.create" },
      { name: "Student 360", icon: Activity, path: "/students/360", permission: "students.view" },
      { name: "Promote Students", icon: ArrowUpDown, path: "/admin/promote", permission: "students.update" },
      { name: "Admissions", icon: FileText, path: "/admin/admissions", permission: "students.create" },
    ],
  },
  {
    title: "Staff",
    icon: UserCircle,
    key: "staff",
    items: [
      { name: "All Staff", icon: UserCircle, path: "/staff", permission: "staff.view" },
      { name: "Add Staff", icon: UserPlus, path: "/staff/add", permission: "staff.create" },
      { name: "Departments", icon: Briefcase, path: "/staff/departments", permission: "staff.view" },
      { name: "Leave Management", icon: Calendar, path: "/leave-requests", permission: "leave.manage" },
    ],
  },
  {
    title: "Parents",
    icon: Heart,
    key: "parents",
    items: [
      { name: "All Parents", icon: Heart, path: "/admin/parents", permission: "parents.view" },
      { name: "Add Parent", icon: UserPlus, path: "/admin/parents/add", permission: "parents.create" },
      { name: "Parent Portal", icon: Globe, path: "/parent/dashboard", permission: "parents.view" },
    ],
  },
  {
    title: "Academics",
    icon: BookOpen,
    key: "academics",
    items: [
      { name: "Academic Year", icon: Calendar, path: "/admin/academic-year", permission: "settings.manage" },
      { name: "Sections", icon: BookOpen, path: "/classes", permission: "settings.manage" },
      { name: "Syllabus", icon: FileText, path: "/admin/syllabus", permission: "academics.view" },
      { name: "Timetable", icon: Clock, path: "/timetable", permission: "timetable.view" },
      { name: "Subjects", icon: Bookmark, path: "/settings", permission: "settings.manage" },
    ],
  },
  {
    title: "Attendance",
    icon: ClipboardCheck,
    key: "attendance",
    items: [
      { name: "Student Attendance", icon: Users, path: "/attendance", permission: "attendance.view" },
      { name: "Staff Attendance", icon: UserCheck, path: "/staff-attendance", permission: "attendance.view" },
      { name: "Attendance Reports", icon: FileSpreadsheet, path: "/attendance/reports", permission: "attendance.view" },
    ],
  },
  {
    title: "Exams & Results",
    icon: Award,
    key: "exams",
    items: [
      { name: "Exams", icon: Award, path: "/teacher/exam-center", permission: "exams.view" },
      { name: "Marks Entry", icon: FileText, path: "/marks", permission: "marks.create" },
      { name: "Results", icon: BarChart3, path: "/result", permission: "exams.view" },
      { name: "Report Cards", icon: FileText, path: "/result/report-cards", permission: "exams.view" },
    ],
  },
  {
    title: "Assignments",
    icon: FileText,
    key: "assignments",
    items: [
      { name: "All Assignments", icon: FileText, path: "/teacher/assignments", permission: "assignments.view" },
      { name: "Create Assignment", icon: PlusCircle, path: "/teacher/assignments/create", permission: "assignments.create" },
      { name: "Grade Assignments", icon: Award, path: "/teacher/assignments/submissions", permission: "assignments.grade" },
    ],
  },
  {
    title: "Quizzes",
    icon: HelpCircle,
    key: "quizzes",
    items: [
      { name: "All Quizzes", icon: HelpCircle, path: "/teacher/quizzes", permission: "quizzes.view" },
      { name: "Create Quiz", icon: PlusCircle, path: "/teacher/quizzes/create", permission: "quizzes.create" },
      { name: "Grade Quiz", icon: Award, path: "/teacher/quizzes/results", permission: "quizzes.grade" },
    ],
  },
  {
    title: "Books & Library",
    icon: Library,
    key: "books",
    items: [
      { name: "Books", icon: BookOpen, path: "/teacher/book-center", permission: "books.view" },
      { name: "Manage Books", icon: FileText, path: "/teacher/manage-books", permission: "books.create" },
      { name: "Categories", icon: Bookmark, path: "/teacher/book-categories", permission: "books.view" },
    ],
  },
  {
    title: "Fees",
    icon: Wallet,
    key: "fees",
    items: [
      { name: "Fee Collection", icon: Wallet, path: "/fees", permission: "fees.create" },
      { name: "Fee Records", icon: FileText, path: "/fees/records", permission: "fees.view" },
      { name: "Fee Reports", icon: FileSpreadsheet, path: "/fees/reports", permission: "fees.view" },
    ],
  },
  {
    title: "Finance",
    icon: DollarSign,
    key: "finance",
    items: [
      { name: "Revenue", icon: TrendingUp, path: "/finance/revenue", permission: "finance.view" },
      { name: "Expenses", icon: DollarSign, path: "/finance/expenses", permission: "finance.view" },
      { name: "Transactions", icon: Activity, path: "/finance/transactions", permission: "finance.view" },
    ],
  },
  {
    title: "Ledger",
    icon: FileText,
    key: "ledger",
    items: [
      { name: "General Ledger", icon: FileText, path: "/ledger", permission: "ledger.view" },
      { name: "Income Ledger", icon: TrendingUp, path: "/ledger/income", permission: "ledger.view" },
      { name: "Expense Ledger", icon: DollarSign, path: "/ledger/expense", permission: "ledger.view" },
    ],
  },
  {
    title: "Transport",
    icon: Bus,
    key: "transport",
    items: [
      { name: "Buses", icon: Bus, path: "/admin/buses", permission: "buses.view" },
      { name: "Routes", icon: Route, path: "/admin/buses/routes", permission: "buses.view" },
      { name: "Assignments", icon: UserCheck, path: "/admin/buses/assignments", permission: "buses.update" },
    ],
  },
  {
    title: "AI Tools",
    icon: Sparkles,
    key: "ai",
    items: [
      { name: "AI Assistant", icon: Bot, path: "/ai-chatbot", permission: "chat.send" },
      { name: "Exam Generator", icon: FileQuestion, path: "/ai-exam-questions", permission: "ai.view" },
      { name: "Timetable Generator", icon: Sparkles, path: "/ai-timetable", permission: "ai.view" },
      { name: "Analytics Assistant", icon: BrainCircuit, path: "/ai-analytics", permission: "ai.view" },
    ],
  },
  {
    title: "Analytics",
    icon: BarChart3,
    key: "analytics",
    items: [
      { name: "Student Analytics", icon: Users, path: "/admin/analytics/students", permission: "analytics.view" },
      { name: "Financial Analytics", icon: DollarSign, path: "/admin/analytics/finance", permission: "analytics.view" },
      { name: "Attendance Analytics", icon: ClipboardCheck, path: "/admin/analytics/attendance", permission: "analytics.view" },
    ],
  },
  {
    title: "Users",
    icon: Users,
    key: "users",
    items: [
      { name: "All Users", icon: Users, path: "/admin/users", permission: "staff.view" },
      { name: "Add User", icon: UserPlus, path: "/admin/users/add", permission: "staff.create" },
      { name: "Role Assignment", icon: ShieldCheck, path: "/admin/users/role", permission: "settings.manage" },
    ],
  },
  {
    title: "Roles & Permissions",
    icon: Shield,
    key: "roles",
    items: [
      { name: "Roles", icon: Shield, path: "/admin/roles", permission: "settings.manage" },
      { name: "Permissions", icon: FileText, path: "/admin/permissions", permission: "settings.manage" },
      { name: "Access Control", icon: ShieldCheck, path: "/admin/access-control", permission: "settings.manage" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    key: "settings",
    items: [
      { name: "School Settings", icon: School, path: "/settings", permission: "settings.manage" },
      { name: "Billing", icon: CreditCard, path: "/settings/billing", permission: "billing.view" },
      { name: "Addons", icon: Package, path: "/settings/addons", permission: "settings.manage" },
      { name: "White Label", icon: Palette, path: "/settings/whitelabel", permission: "settings.manage" },
      { name: "Integrations", icon: Link2, path: "/settings/integrations", permission: "settings.manage" },
    ],
  },
  {
    title: "Feature Flags",
    icon: Flag,
    key: "featureFlags",
    items: [
      { name: "Enable Features", icon: Flag, path: "/admin/feature-flags", permission: "settings.manage" },
      { name: "Disable Features", icon: Flag, path: "/admin/feature-flags?mode=disable", permission: "settings.manage" },
      { name: "Beta Features", icon: Sparkles, path: "/admin/feature-flags/beta", permission: "settings.manage" },
    ],
  },
  {
    title: "Audit Logs",
    icon: ScrollText,
    key: "audit",
    items: [
      { name: "User Logs", icon: Users, path: "/admin/audit/users", permission: "audit.view" },
      { name: "Security Logs", icon: Shield, path: "/admin/audit/security", permission: "audit.view" },
      { name: "System Events", icon: Activity, path: "/admin/audit/system", permission: "audit.view" },
    ],
  },
  {
    title: "White Label",
    icon: Palette,
    key: "whitelabel",
    items: [
      { name: "Logo", icon: FileText, path: "/settings/whitelabel", permission: "settings.manage" },
      { name: "Theme", icon: PaintBucket, path: "/settings/whitelabel/theme", permission: "settings.manage" },
      { name: "Branding", icon: Palette, path: "/settings/whitelabel", permission: "settings.manage" },
      { name: "Custom Domain", icon: Globe, path: "/settings/whitelabel/domain", permission: "settings.manage" },
    ],
  },
];

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const { user, loading: authLoading } = useAuth();

  const role = user?.role || "teacher";
  const userPermissions: string[] = (ROLE_PERMISSIONS as Record<string, string[]>)[role] || [];

  // صرف وہ گروپ دکھائیں جن کی کم از کم ایک ذیلی آئٹم کی پرمیشن یوزر کے پاس ہو
  const visibleGroups = MENU_GROUPS.map((group) => {
    const filteredItems = group.items.filter(
      (item) => !item.permission || userPermissions.includes(item.permission)
    );
    return { ...group, items: filteredItems };
  }).filter((group) => group.items.length > 0);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = async () => {
    await signOut(auth);
    await fetch("/api/v1/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      <button
        className="md:hidden fixed top-4 right-4 z-50 p-2.5 bg-white rounded-xl shadow-lg border border-gray-100"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } bg-white border-r border-gray-100 shadow-sm`}
      >
        <div
          className="h-20 px-6 border-b border-gray-100 flex items-center gap-3 cursor-pointer shrink-0"
          onClick={() => router.push("/dashboard")}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-gray-800">EduPilot</span>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          {visibleGroups.map((group) => {
            const isOpen = openGroups[group.key] ?? false;
            const isActive = pathname.startsWith(group.items[0]?.path?.split("/")[1] || "");

            return (
              <div key={group.key} className="mb-1">
                <div
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => toggleGroup(group.key)}
                >
                  <div className="flex items-center gap-3">
                    <group.icon size={18} className={isActive ? "text-blue-600" : "text-gray-400"} />
                    <span className="text-sm font-medium">{group.title}</span>
                  </div>
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>

                {isOpen && (
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-100 pl-2">
                    {group.items.map((item) => {
                      const itemActive = pathname === item.path || pathname.startsWith(item.path + "/");
                      return (
                        <Link
                          key={item.name}
                          href={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                            itemActive
                              ? "bg-blue-50 text-blue-700 font-medium shadow-sm border border-blue-100"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <item.icon size={16} className={itemActive ? "text-blue-600" : "text-gray-400"} />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-bold text-sm"
          >
            <LogOut size={18} />
            <span>Secure Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto pb-24 md:pb-8">{children}</div>
      </div>
    </div>
  );
}
