// lib/config/menu.config.ts
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  UserCircle,
  ClipboardCheck,
  Wallet,
  Clock,
  Settings,
  GraduationCap,
  DollarSign,
  Calendar,
  FileText,
  Heart,
  CreditCard,
  Sparkles,
  Bus,
  CalendarDays,
  Bot,
  Film,
  Send,
  Star,
  PlusCircle,
  Building2,
  School,
  Activity,
  ShieldCheck,
  ToggleRight,
  Palette,
  Lock,
  History,
  TrendingUp,
  Award,
  FileQuestion,
  BrainCircuit,
  MessageSquare,
  ScanLine,
  Compass,
  Package,
} from "lucide-react";

export interface MenuItemDef {
  id: string;
  name: string;
  icon: LucideIcon;
  path: string;
  requiredPermission?: string;
  featureFlag?: string;
}

export interface MenuGroupDef {
  title: string;
  icon: LucideIcon;
  key: string | null;
  items: MenuItemDef[];
}

export const ALL_MENU_GROUPS: MenuGroupDef[] = [
  // ── Command Center ────────────────────────
  {
    title: "Command Center",
    icon: LayoutDashboard,
    key: null,
    items: [
      {
        id: "dashboard",
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",
        requiredPermission: "analytics.view",
      },
      {
        id: "analytics",
        name: "Analytics",
        icon: TrendingUp,
        path: "/admin/analytics",
        requiredPermission: "analytics.view",
      },
      {
        id: "config-dashboard",
        name: "Configuration Dashboard",
        icon: Activity,
        path: "/admin/configuration-dashboard",
        requiredPermission: "settings.manage",
      },
    ],
  },
  // ── Students ──────────────────────────────
  {
    title: "Students",
    icon: Users,
    key: "students",
    items: [
      {
        id: "students",
        name: "Students",
        icon: Users,
        path: "/students",
        requiredPermission: "students.view",
      },
      {
        id: "add-student",
        name: "Add Student",
        icon: PlusCircle,
        path: "/students/add",
        requiredPermission: "students.create",
      },
      {
        id: "student-360",
        name: "Student 360",
        icon: Activity,
        path: "/student-profile",
        requiredPermission: "students.view",
      },
      {
        id: "ocr-admission",
        name: "OCR Admission",
        icon: ScanLine,
        path: "/students/ocr-admission",
        requiredPermission: "students.create",
      },
      {
        id: "admissions",
        name: "Admissions",
        icon: FileText,
        path: "/admin/admissions",
        requiredPermission: "students.create",
        featureFlag: "admissions",
      },
      {
        id: "promote",
        name: "Promote Students",
        icon: GraduationCap,
        path: "/admin/promote",
        requiredPermission: "students.update",
      },
    ],
  },
  // ── Academic ──────────────────────────────
  {
    title: "Academic",
    icon: BookOpen,
    key: "academic",
    items: [
      {
        id: "classes",
        name: "Classes",
        icon: GraduationCap,
        path: "/classes",
        requiredPermission: "settings.manage",
      },
      {
        id: "sections",
        name: "Sections & Allocation",
        icon: BookOpen,
        path: "/admin/sections",
        requiredPermission: "settings.manage",
      },
      {
        id: "syllabus",
        name: "Admin Syllabus",
        icon: FileText,
        path: "/admin/syllabus",
        requiredPermission: "settings.manage",
      },
      {
        id: "course-syllabus",
        name: "Course Syllabus",
        icon: FileText,
        path: "/syllabus",
        requiredPermission: "academics.view",
      },
      {
        id: "exams-mgmt",
        name: "Exams",
        icon: Award,
        path: "/exams",
        requiredPermission: "exams.view",
      },
      {
        id: "academic-year",
        name: "Academic Year",
        icon: Calendar,
        path: "/admin/academic-year",
        requiredPermission: "settings.manage",
      },
      {
        id: "timetable",
        name: "Timetable",
        icon: Clock,
        path: "/timetable",
        requiredPermission: "timetable.view",
      },
      {
        id: "video-library",
        name: "Video Library",
        icon: Film,
        path: "/video-lectures",
        requiredPermission: "videoLectures.view",
      },
      {
        id: "study-center",
        name: "Study Center",
        icon: Compass,
        path: "/study-center",
        requiredPermission: "students.view",
      },
    ],
  },
  // ── Finance ───────────────────────────────
  {
    title: "Finance",
    icon: DollarSign,
    key: "finance",
    items: [
      {
        id: "fees",
        name: "Fees & Ledger",
        icon: Wallet,
        path: "/fees",
        requiredPermission: "fees.view",
      },
      {
        id: "billing",
        name: "Billing & Subscription",
        icon: CreditCard,
        path: "/settings/billing",
        requiredPermission: "billing.view",
      },
    ],
  },
  // ── Operations ────────────────────────────
  {
    title: "Operations",
    icon: Clock,
    key: "operations",
    items: [
      {
        id: "attendance",
        name: "Student Attendance",
        icon: ClipboardCheck,
        path: "/attendance",
        requiredPermission: "attendance.view",
      },
      {
        id: "staff-attendance",
        name: "Staff Attendance",
        icon: ClipboardCheck,
        path: "/staff-attendance",
        requiredPermission: "attendance.view",
      },
      {
        id: "buses",
        name: "Buses",
        icon: Bus,
        path: "/admin/buses",
        requiredPermission: "buses.view",
        featureFlag: "transport",
      },
    ],
  },
  // ── Staff ─────────────────────────────────
  {
    title: "Staff",
    icon: UserCircle,
    key: "staff",
    items: [
      {
        id: "staff-management",
        name: "Staff Management",
        icon: UserCircle,
        path: "/staff",
        requiredPermission: "staff.view",
      },
      {
        id: "add-staff",
        name: "Add Staff",
        icon: PlusCircle,
        path: "/staff/add",
        requiredPermission: "staff.create",
      },
      {
        id: "staff-ocr",
        name: "Staff OCR",
        icon: ScanLine,
        path: "/staff/ocr",
        requiredPermission: "staff.create",
      },
      {
        id: "departments",
        name: "Departments",
        icon: Building2,
        path: "/staff/departments",
        requiredPermission: "staff.view",
      },
      {
        id: "leave-requests",
        name: "Leave Requests",
        icon: CalendarDays,
        path: "/leave-requests",
        requiredPermission: "leave.manage",
      },
    ],
  },
  // ── Teacher Tools ─────────────────────────
  {
    title: "Teacher Tools",
    icon: BookOpen,
    key: "teacher",
    items: [
      {
        id: "homework",
        name: "Homework",
        icon: FileText,
        path: "/teacher/homework",
        requiredPermission: "homework.create",
      },
      {
        id: "assignments",
        name: "Assignments",
        icon: FileText,
        path: "/teacher/assignments",
        requiredPermission: "assignments.create",
      },
      {
        id: "quizzes",
        name: "Quizzes",
        icon: FileQuestion,
        path: "/teacher/quizzes",
        requiredPermission: "quizzes.create",
      },
      {
        id: "lesson-plans",
        name: "Lesson Plans",
        icon: Calendar,
        path: "/teacher/lesson-plans",
        requiredPermission: "lessonPlans.create",
      },
      {
        id: "book-center",
        name: "Book Center",
        icon: BookOpen,
        path: "/teacher/book-center",
        requiredPermission: "bookCenter.view",
        featureFlag: "bookCenter",
      },
      {
        id: "manage-books",
        name: "Manage Books",
        icon: FileText,
        path: "/teacher/manage-books",
        requiredPermission: "bookCenter.create",
        featureFlag: "bookCenter",
      },
      {
        id: "exam-center",
        name: "Exam Center",
        icon: Award,
        path: "/teacher/exam-center",
        requiredPermission: "exams.view",
        featureFlag: "examCenter",
      },
      {
        id: "marks-entry",
        name: "Marks Entry",
        icon: FileText,
        path: "/marks",
        requiredPermission: "marks.create",
      },
      {
        id: "exam-results",
        name: "Exam Results",
        icon: TrendingUp,
        path: "/result",
        requiredPermission: "exams.view",
      },
      {
        id: "video-lectures",
        name: "Video Lectures",
        icon: Film,
        path: "/teacher/video-lectures",
        requiredPermission: "videoLectures.create",
        featureFlag: "videoLectures",
      },
      {
        id: "chat",
        name: "Chat",
        icon: Send,
        path: "/teacher/chat",
        requiredPermission: "chat.send",
      },
      {
        id: "skills",
        name: "Skills",
        icon: Star,
        path: "/teacher/skills",
        requiredPermission: "skills.view",
        featureFlag: "skills",
      },
      {
        id: "behavior",
        name: "Behavior Points",
        icon: PlusCircle,
        path: "/teacher/behavior",
        requiredPermission: "behavior.view",
        featureFlag: "behavior",
      },
    ],
  },
  // ── AI Tools ─────────────────────────────
  {
    title: "AI Tools",
    icon: Sparkles,
    key: "aiTools",
    items: [
      {
        id: "ai-chatbot",
        name: "AI Assistant",
        icon: Bot,
        path: "/ai-chatbot",
        requiredPermission: "chat.send",
        featureFlag: "aiAssistant",
      },
      {
        id: "principal-copilot",
        name: "Principal Copilot",
        icon: BrainCircuit,
        path: "/ai/principal-copilot",
        requiredPermission: "ai.view",
      },
      {
        id: "ai-exam-questions",
        name: "AI Exam Generator",
        icon: FileQuestion,
        path: "/ai-exam-questions",
        requiredPermission: "ai.view",
        featureFlag: "aiExamGenerator",
      },
      {
        id: "ai-timetable-menu",
        name: "AI Timetable",
        icon: Sparkles,
        path: "/ai-timetable",
        requiredPermission: "ai.view",
        featureFlag: "aiTimetable",
      },
      {
        id: "report-comments",
        name: "Report Comments AI",
        icon: FileText,
        path: "/ai/report-comments",
        requiredPermission: "ai.view",
      },
      {
        id: "smart-book-center",
        name: "Smart Book Center",
        icon: BookOpen,
        path: "/ai/smart-book-center",
        requiredPermission: "ai.view",
      },
    ],
  },
  // ── Parents ──────────────────────────────
  {
    title: "Parents",
    icon: Heart,
    key: "parents",
    items: [
      {
        id: "parents-directory",
        name: "Parents Directory",
        icon: Heart,
        path: "/admin/parents",
        requiredPermission: "parents.view",
      },
      {
        id: "parent-portal",
        name: "Parent Dashboard",
        icon: Heart,
        path: "/parent/dashboard",
        requiredPermission: "parents.view",
      },
      {
        id: "parent-chat",
        name: "Parent Chat",
        icon: MessageSquare,
        path: "/parent/chat",
        requiredPermission: "parents.view",
      },
    ],
  },
  // ── 🚀 ENTERPRISE ADMIN TOOLS ───────────────
  {
    title: "Admin Tools",
    icon: Settings,
    key: "adminTools",
    items: [
      {
        id: "configuration-dashboard",
        name: "Configuration Dashboard",
        icon: Activity,
        path: "/admin/configuration-dashboard",
        requiredPermission: "settings.manage",
      },
      {
        id: "school-setup",
        name: "School Setup",
        icon: School,
        path: "/admin/school-setup",
        requiredPermission: "settings.manage",
      },
      {
        id: "general-settings",
        name: "School Profile",
        icon: Building2,
        path: "/settings/general",
        requiredPermission: "settings.manage",
      },
      {
        id: "users-identity",
        name: "Users & Identity",
        icon: ShieldCheck,
        path: "/admin/users",
        requiredPermission: "settings.manage",
      },
      {
        id: "security-center",
        name: "Security Center",
        icon: Lock,
        path: "/admin/security",
        requiredPermission: "settings.manage",
      },
      {
        id: "audit-center",
        name: "Audit Center",
        icon: History,
        path: "/admin/audit",
        requiredPermission: "audit.view",
      },
      {
        id: "feature-flags",
        name: "Feature Flags",
        icon: ToggleRight,
        path: "/admin/feature-flags",
        requiredPermission: "settings.manage",
      },
      {
        id: "menu-manager",
        name: "Menu Manager",
        icon: Settings,
        path: "/admin/menu-manager",
        requiredPermission: "settings.manage",
      },
      {
        id: "billing",
        name: "Subscription",
        icon: CreditCard,
        path: "/settings/billing",
        requiredPermission: "billing.view",
      },
      {
        id: "whitelabel",
        name: "White Label",
        icon: Palette,
        path: "/settings/whitelabel",
        requiredPermission: "settings.manage",
      },
      {
        id: "admin-branding",
        name: "Admin Branding",
        icon: Palette,
        path: "/admin/whitelabel",
        requiredPermission: "settings.manage",
      },
      {
        id: "curriculum-settings",
        name: "Curriculum Settings",
        icon: BookOpen,
        path: "/settings/curriculum",
        requiredPermission: "settings.manage",
      },
      {
        id: "school-settings",
        name: "School Settings",
        icon: Settings,
        path: "/settings",
        requiredPermission: "settings.manage",
      },
      {
        id: "addons-settings",
        name: "Addons",
        icon: Package,
        path: "/settings/addons",
        requiredPermission: "settings.manage",
      },
    ],
  },
  // ── Super Admin ───────────────────────────
  {
    title: "Super Admin",
    icon: ShieldCheck,
    key: "superAdmin",
    items: [
      {
        id: "superadmin-analytics",
        name: "Platform Analytics",
        icon: TrendingUp,
        path: "/super-admin/analytics",
        requiredPermission: "settings.manage",
      },
      {
        id: "superadmin-telemetry",
        name: "System Telemetry",
        icon: Activity,
        path: "/super-admin/telemetry",
        requiredPermission: "settings.manage",
      },
    ],
  },
];

export function getFilteredMenu(
  userRole: string,
  permissions: string[],
  featureFlags: Record<string, boolean>
): MenuGroupDef[] {
  return ALL_MENU_GROUPS.map((group) => {
    const filteredItems = group.items.filter((item) => {
      // 1. Super Admin Bypass
      if (userRole === "superAdmin" || userRole === "super_admin" || userRole === "admin") {
        return true;
      }

      // 2. Check Permission
      if (item.requiredPermission && !permissions.includes(item.requiredPermission)) {
        return false;
      }

      // 3. Check Feature Flag
      if (
        item.featureFlag &&
        featureFlags.hasOwnProperty(item.featureFlag) &&
        featureFlags[item.featureFlag] === false
      ) {
        return false;
      }
      return true;
    });
    return { ...group, items: filteredItems };
  }).filter((group) => group.items.length > 0);
}
