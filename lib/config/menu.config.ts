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
} from "lucide-react";

export interface MenuItemDef {
  id: string;
  name: string;
  icon: LucideIcon;
  path: string;
  requiredPermission?: string;   // اب صرف وہی سٹرنگ جو permissions.ts میں موجود ہے
  featureFlag?: string;
}

export interface MenuGroupDef {
  title: string;
  icon: LucideIcon;
  key: string | null;
  items: MenuItemDef[];
}

const ALL_MENU_GROUPS: MenuGroupDef[] = [
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
        requiredPermission: "analytics.view",   // matches PERMISSIONS.analytics.view
      },
    ],
  },
  {
    title: "Academic",
    icon: BookOpen,
    key: "academic",
    items: [
      {
        id: "students",
        name: "Students",
        icon: Users,
        path: "/students",
        requiredPermission: "students.view",
      },
      {
        id: "classes",
        name: "Classes & Sections",
        icon: GraduationCap,
        path: "/classes",
        requiredPermission: "settings.manage",
      },
      {
        id: "syllabus",
        name: "Syllabus",
        icon: FileText,
        path: "/admin/syllabus",
        requiredPermission: "settings.manage",
      },
      {
        id: "academic-year",
        name: "Academic Year",
        icon: Calendar,
        path: "/admin/academic-year",
        requiredPermission: "settings.manage",
      },
      {
        id: "video-library",
        name: "Video Library",
        icon: Film,
        path: "/video-lectures",
        requiredPermission: "videoLectures.view",
      },
    ],
  },
  {
    title: "Finance",
    icon: DollarSign,
    key: "finance",
    items: [
      {
        id: "fees",
        name: "Fees",
        icon: Wallet,
        path: "/fees",
        requiredPermission: "fees.view",
      },
      {
        id: "ledger",
        name: "Ledger",
        icon: ClipboardCheck,
        path: "/ledger",
        requiredPermission: "ledger.view",
      },
    ],
  },
  {
    title: "Operations",
    icon: Clock,
    key: "operations",
    items: [
      {
        id: "attendance",
        name: "Attendance",
        icon: ClipboardCheck,
        path: "/attendance",
        requiredPermission: "attendance.view",
      },
      {
        id: "timetable",
        name: "Timetable",
        icon: Clock,
        path: "/timetable",
        requiredPermission: "timetable.view",   // نیا نام
      },
      {
        id: "ai-timetable",
        name: "AI Timetable",
        icon: Sparkles,
        path: "/ai-timetable",
        requiredPermission: "ai.view",          // عمومی AI پرمیشن، فیچر فلیگ سے کنٹرول
        featureFlag: "aiTimetable",
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
        id: "parents",
        name: "Parents",
        icon: Heart,
        path: "/admin/parents",
        requiredPermission: "parents.view",
      },
      {
        id: "leave-requests",
        name: "Leave Requests",
        icon: CalendarDays,
        path: "/leave-requests",
        requiredPermission: "leave.manage",     // نئی پرمیشن
      },
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
        icon: FileText,
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
        requiredPermission: "books.view",       // books ماڈیول کی پرمیشن
        featureFlag: "bookCenter",
      },
      {
        id: "manage-books",
        name: "Manage Books",
        icon: FileText,
        path: "/teacher/manage-books",
        requiredPermission: "books.create",     // books.create
        featureFlag: "bookCenter",
      },
      {
        id: "exam-center",
        name: "Exam Center",
        icon: FileText,
        path: "/teacher/exam-center",
        requiredPermission: "exams.view",       // exams.view
        featureFlag: "examCenter",
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
        id: "admissions",
        name: "Admissions",
        icon: FileText,
        path: "/admin/admissions",
        requiredPermission: "students.create",  // admissions کے لیے students.create استعمال کریں
        featureFlag: "admissions",
      },
      {
        id: "skills",
        name: "Skills",
        icon: Star,
        path: "/teacher/skills",
        requiredPermission: "skills.view",      // skills.view
        featureFlag: "skills",
      },
      {
        id: "behavior",
        name: "Behavior Points",
        icon: PlusCircle,
        path: "/teacher/behavior",
        requiredPermission: "behavior.view",    // behavior.view
        featureFlag: "behavior",
      },
    ],
  },
  {
    title: "Admin Tools",
    icon: Settings,
    key: "adminTools",
    items: [
      {
        id: "settings",
        name: "Settings",
        icon: Settings,
        path: "/settings",
        requiredPermission: "settings.manage",
      },
      {
        id: "users",
        name: "Users",
        icon: Users,
        path: "/admin/users",
        requiredPermission: "staff.view",
      },
      {
        id: "audit-logs",
        name: "Audit Logs",
        icon: FileText,
        path: "/admin/audit",
        requiredPermission: "audit.view",
      },
      {
        id: "billing",
        name: "Billing",
        icon: CreditCard,
        path: "/settings/billing",
        requiredPermission: "billing.view",
      },
    ],
  },
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
        id: "ai-exam-questions",
        name: "AI Exam Generator",
        icon: FileText,
        path: "/ai-exam-questions",
        requiredPermission: "ai.view",          // عمومی AI پرمیشن
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
    ],
  },
];

export function getFilteredMenu(
  permissions: string[],
  featureFlags: Record<string, boolean>
): MenuGroupDef[] {
  return ALL_MENU_GROUPS.map((group) => {
    const filteredItems = group.items.filter((item) => {
      if (item.requiredPermission && !permissions.includes(item.requiredPermission)) {
        return false;
      }
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
