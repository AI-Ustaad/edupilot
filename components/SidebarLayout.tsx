"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  Menu, X, LogOut, ShieldCheck, ChevronDown, ChevronRight,
  LayoutDashboard, TrendingUp, Users, UserCircle,
  GraduationCap, BookOpen, Clock, Award, ClipboardCheck,
  Wallet, DollarSign, Bus, Sparkles, Settings,
  Flag, ScrollText, Palette, Heart, PlusCircle, Calendar,
  CreditCard, Package, Bookmark,
  UserCheck, UserPlus, Library,
  Bot, FileQuestion, BrainCircuit, School, Activity, Briefcase,
  ArrowUpDown, Shield, Globe, FileText, Film, MessageSquare,
  ScanLine, Compass
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROLE_PERMISSIONS } from "@/lib/auth/roles";
import { logoutUser } from "@/lib/auth/auth-client";

// ─── مینو ڈھانچہ (گروپس + ذیلی آئٹمز) ──────────────
const MENU_GROUPS = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    key: "dashboard",
    items: [
      { name: "Overview", icon: LayoutDashboard, path: "/dashboard", permission: "analytics.view" },
      { name: "Analytics", icon: TrendingUp, path: "/admin/analytics", permission: "analytics.view" },
      { name: "Config Dashboard", icon: Activity, path: "/admin/configuration-dashboard", permission: "settings.manage" },
    ],
  },
  {
    title: "Students",
    icon: Users,
    key: "students",
    items: [
      { name: "All Students", icon: Users, path: "/students", permission: "students.view" },
      { name: "Add Student", icon: UserPlus, path: "/students/add", permission: "students.create" },
      { name: "Student 360", icon: Activity, path: "/student-profile", permission: "students.view" },
      { name: "OCR Admission", icon: ScanLine, path: "/students/ocr-admission", permission: "students.create" },
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
      { name: "Staff OCR", icon: ScanLine, path: "/staff/ocr", permission: "staff.create" },
      { name: "Departments", icon: Briefcase, path: "/staff/departments", permission: "staff.view" },
      { name: "Leave Requests", icon: Calendar, path: "/leave-requests", permission: "leave.manage" },
    ],
  },
  {
    title: "Academics",
    icon: BookOpen,
    key: "academics",
    items: [
      { name: "Classes", icon: GraduationCap, path: "/classes", permission: "settings.manage" },
      { name: "Sections & Allocation", icon: BookOpen, path: "/admin/sections", permission: "settings.manage" },
      { name: "Admin Syllabus", icon: FileText, path: "/admin/syllabus", permission: "academics.view" },
      { name: "Course Syllabus", icon: Bookmark, path: "/syllabus", permission: "academics.view" },
      { name: "Exam Management", icon: Award, path: "/exams", permission: "exams.view" },
      { name: "Academic Year", icon: Calendar, path: "/admin/academic-year", permission: "settings.manage" },
      { name: "Timetable", icon: Clock, path: "/timetable", permission: "timetable.view" },
      { name: "School Setup", icon: School, path: "/admin/school-setup", permission: "settings.manage" },
    ],
  },
  {
    title: "Attendance",
    icon: ClipboardCheck,
    key: "attendance",
    items: [
      { name: "Student Attendance", icon: Users, path: "/attendance", permission: "attendance.view" },
      { name: "Staff Attendance", icon: UserCheck, path: "/staff-attendance", permission: "attendance.view" },
    ],
  },
  {
    title: "Exams & Results",
    icon: Award,
    key: "exams",
    items: [
      { name: "Teacher Exam Center", icon: Award, path: "/teacher/exam-center", permission: "exams.view" },
      { name: "Marks Entry", icon: FileText, path: "/marks", permission: "marks.create" },
      { name: "Exam Results", icon: TrendingUp, path: "/result", permission: "exams.view" },
    ],
  },
  {
    title: "Teaching Tools",
    icon: FileText,
    key: "teaching",
    items: [
      { name: "Assignments", icon: FileText, path: "/teacher/assignments", permission: "assignments.view" },
      { name: "Create Assignment", icon: PlusCircle, path: "/teacher/assignments/create", permission: "assignments.create" },
      { name: "Submissions", icon: Award, path: "/teacher/assignments/submissions", permission: "assignments.grade" },
      { name: "Quizzes", icon: FileQuestion, path: "/teacher/quizzes", permission: "quizzes.view" },
      { name: "Quiz Results", icon: Award, path: "/teacher/quizzes/results", permission: "quizzes.grade" },
      { name: "Homework", icon: FileText, path: "/teacher/homework", permission: "homework.create" },
      { name: "Lesson Plans", icon: Calendar, path: "/teacher/lesson-plans", permission: "lessonPlans.create" },
      { name: "Skills Assessment", icon: Activity, path: "/teacher/skills", permission: "skills.view" },
      { name: "Behavior Points", icon: PlusCircle, path: "/teacher/behavior", permission: "behavior.view" },
      { name: "Teacher Chat", icon: MessageSquare, path: "/teacher/chat", permission: "chat.send" },
    ],
  },
  {
    title: "Learning & Library",
    icon: Library,
    key: "library",
    items: [
      { name: "Book Center", icon: BookOpen, path: "/teacher/book-center", permission: "bookCenter.view" },
      { name: "Manage Books", icon: FileText, path: "/teacher/manage-books", permission: "bookCenter.create" },
      { name: "Teacher Lectures", icon: Film, path: "/teacher/video-lectures", permission: "videoLectures.create" },
      { name: "Video Library", icon: Film, path: "/video-lectures", permission: "videoLectures.view" },
      { name: "Study Center", icon: Compass, path: "/study-center", permission: "students.view" },
    ],
  },
  {
    title: "Fees & Finance",
    icon: Wallet,
    key: "fees",
    items: [
      { name: "Fee Management", icon: Wallet, path: "/fees", permission: "fees.view" },
    ],
  },
  {
    title: "Operations",
    icon: Bus,
    key: "operations",
    items: [
      { name: "Buses & Transport", icon: Bus, path: "/admin/buses", permission: "buses.view" },
    ],
  },
  {
    title: "AI Copilot & Agents",
    icon: Sparkles,
    key: "ai",
    items: [
      { name: "AI Assistant", icon: Bot, path: "/ai-chatbot", permission: "chat.send" },
      { name: "Principal Copilot", icon: BrainCircuit, path: "/ai/principal-copilot", permission: "ai.view" },
      { name: "Exam Generator", icon: FileQuestion, path: "/ai-exam-questions", permission: "ai.view" },
      { name: "Timetable Generator", icon: Sparkles, path: "/ai-timetable", permission: "ai.view" },
      { name: "Report Comments AI", icon: FileText, path: "/ai/report-comments", permission: "ai.view" },
      { name: "Smart Book Center", icon: Library, path: "/ai/smart-book-center", permission: "ai.view" },
    ],
  },
  {
    title: "Parents",
    icon: Heart,
    key: "parents",
    items: [
      { name: "Parent Directory", icon: Heart, path: "/admin/parents", permission: "parents.view" },
      { name: "Parent Dashboard", icon: Globe, path: "/parent/dashboard", permission: "parents.view" },
      { name: "Parent Chat", icon: MessageSquare, path: "/parent/chat", permission: "parents.view" },
    ],
  },
  {
    title: "Security & Governance",
    icon: Shield,
    key: "governance",
    items: [
      { name: "Users & Identity", icon: Users, path: "/admin/users", permission: "settings.manage" },
      { name: "Security Center", icon: ShieldCheck, path: "/admin/security", permission: "settings.manage" },
      { name: "Audit Center", icon: ScrollText, path: "/admin/audit", permission: "audit.view" },
      { name: "Feature Flags", icon: Flag, path: "/admin/feature-flags", permission: "settings.manage" },
      { name: "Menu Manager", icon: Settings, path: "/admin/menu-manager", permission: "settings.manage" },
    ],
  },
  {
    title: "Settings & Billing",
    icon: Settings,
    key: "settings",
    items: [
      { name: "General Settings", icon: School, path: "/settings/general", permission: "settings.manage" },
      { name: "School Configuration", icon: Settings, path: "/settings", permission: "settings.manage" },
      { name: "Classes & Curriculum", icon: BookOpen, path: "/settings/curriculum", permission: "settings.manage" },
      { name: "Subscription & Billing", icon: CreditCard, path: "/settings/billing", permission: "billing.view" },
      { name: "Addons & Modules", icon: Package, path: "/settings/addons", permission: "settings.manage" },
      { name: "White Label (Settings)", icon: Palette, path: "/settings/whitelabel", permission: "settings.manage" },
      { name: "Admin Branding", icon: Palette, path: "/admin/whitelabel", permission: "settings.manage" },
    ],
  },
  {
    title: "Super Admin",
    icon: ShieldCheck,
    key: "superadmin",
    items: [
      { name: "Platform Analytics", icon: TrendingUp, path: "/super-admin/analytics", permission: "superadmin.view" },
      { name: "System Telemetry", icon: Activity, path: "/super-admin/telemetry", permission: "superadmin.view" },
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
  const isSuperAdmin = role === "superAdmin" || role === "super_admin";
  const userPermissions: string[] = isSuperAdmin
    ? [...Object.values(ROLE_PERMISSIONS).flat(), "superadmin.view", "settings.manage", "analytics.view", "billing.view"]
    : (ROLE_PERMISSIONS as Record<string, string[]>)[role] || [];

  // صرف وہ گروپ دکھائیں جن کی کم از کم ایک ذیلی آئٹم کی پرمیشن یوزر کے پاس ہو
  const visibleGroups = MENU_GROUPS.map((group) => {
    const filteredItems = group.items.filter(
      (item) => !item.permission || userPermissions.includes(item.permission) || isSuperAdmin
    );
    return { ...group, items: filteredItems };
  }).filter((group) => group.items.length > 0);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = async () => {
    await logoutUser("/login");
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
            const isActive = group.items.some((item) => pathname === item.path || pathname.startsWith(item.path + "/"));

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
