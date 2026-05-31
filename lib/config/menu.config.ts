// lib/config/menu.config.ts
import { MenuGroup } from "@/types/menu";
import { PERMISSIONS } from "@/lib/auth/permissions";

export const DEFAULT_MENU: MenuGroup[] = [
  {
    labelKey: "commandCenter",
    icon: "LayoutDashboard",
    children: [
      {
        labelKey: "commandCenter",
        icon: "LayoutDashboard",
        path: "/dashboard",
        permission: PERMISSIONS.dashboard.view,
        allowedRoles: ["admin", "teacher", "accountant"],
      },
    ],
  },
  {
    labelKey: "academic",
    icon: "BookOpen",
    permission: PERMISSIONS.students.view,
    allowedRoles: ["admin", "teacher", "parent"],
    children: [
      {
        labelKey: "students",
        icon: "Users",
        path: "/students",
        permission: PERMISSIONS.students.view,
        allowedRoles: ["admin", "teacher"],
      },
      {
        labelKey: "classes",
        icon: "GraduationCap",
        path: "/classes",
        allowedRoles: ["admin"],
      },
      {
        labelKey: "syllabus",
        icon: "FileText",
        path: "/admin/syllabus",
        allowedRoles: ["admin"],
      },
      {
        labelKey: "academicYear",
        icon: "Calendar",
        path: "/admin/academic-year",
        allowedRoles: ["admin"],
      },
      {
        labelKey: "videoLibrary",
        icon: "Film",
        path: "/video-lectures",
        allowedRoles: ["admin", "teacher", "parent"],
      },
    ],
  },
  {
    labelKey: "finance",
    icon: "DollarSign",
    permission: PERMISSIONS.fees.view,
    allowedRoles: ["admin", "accountant"],
    children: [
      {
        labelKey: "fees",
        icon: "Wallet",
        path: "/fees",
        permission: PERMISSIONS.fees.view,
        allowedRoles: ["admin", "accountant"],
      },
      // ledger removed for now; can be added later
    ],
  },
  {
    labelKey: "operations",
    icon: "Clock",
    permission: PERMISSIONS.attendance.view,
    allowedRoles: ["admin", "teacher"],
    children: [
      {
        labelKey: "attendance",
        icon: "ClipboardCheck",
        path: "/attendance",
        permission: PERMISSIONS.attendance.view,
        allowedRoles: ["admin", "teacher"],
      },
      {
        labelKey: "timetable",
        icon: "Clock",
        path: "/timetable",
        allowedRoles: ["admin", "teacher"],
      },
      {
        labelKey: "aiTimetable",
        icon: "Sparkles",
        path: "/ai-timetable",
        allowedRoles: ["admin", "teacher"],
      },
      {
        labelKey: "buses",
        icon: "Bus",
        path: "/admin/buses",
        allowedRoles: ["admin"],
      },
    ],
  },
  {
    labelKey: "staff",
    icon: "UserCircle",
    permission: PERMISSIONS.staff.view,
    allowedRoles: ["admin"],
    children: [
      {
        labelKey: "staffManagement",
        icon: "UserCircle",
        path: "/staff",
        permission: PERMISSIONS.staff.view,
        allowedRoles: ["admin"],
      },
      {
        labelKey: "parents",
        icon: "Heart",
        path: "/admin/parents",
        allowedRoles: ["admin"],
      },
      {
        labelKey: "leaveRequests",
        icon: "CalendarDays",
        path: "/leave-requests",
        allowedRoles: ["admin"],
      },
      {
        labelKey: "postHomework",
        icon: "FileText",
        path: "/teacher/homework",
        allowedRoles: ["admin", "teacher"],
      },
      {
        labelKey: "assignments",
        icon: "FileText",
        path: "/teacher/assignments",
        allowedRoles: ["admin", "teacher"],
      },
      {
        labelKey: "quizzes",
        icon: "FileText",
        path: "/teacher/quizzes",
        allowedRoles: ["admin", "teacher"],
      },
      {
        labelKey: "lessonPlans",
        icon: "Calendar",
        path: "/teacher/lesson-plans",
        allowedRoles: ["admin", "teacher"],
      },
      {
        labelKey: "bookCenter",
        icon: "BookOpen",
        path: "/teacher/book-center",
        allowedRoles: ["admin", "teacher"],
      },
      {
        labelKey: "manageBooks",
        icon: "FileText",
        path: "/teacher/manage-books",
        allowedRoles: ["admin", "teacher"],
      },
      {
        labelKey: "examCenter",
        icon: "FileText",
        path: "/teacher/exam-center",
        allowedRoles: ["admin", "teacher"],
      },
      {
        labelKey: "videoLectures",
        icon: "Film",
        path: "/teacher/video-lectures",
        allowedRoles: ["admin", "teacher"],
      },
      {
        labelKey: "chat",
        icon: "Send",
        path: "/teacher/chat",
        allowedRoles: ["admin", "teacher"],
      },
      {
        labelKey: "admissions",
        icon: "FileText",
        path: "/admin/admissions",
        allowedRoles: ["admin"],
      },
      {
        labelKey: "addSkills",
        icon: "Star",
        path: "/teacher/skills",
        allowedRoles: ["admin", "teacher"],
      },
      {
        labelKey: "behaviorPoints",
        icon: "PlusCircle",
        path: "/teacher/behavior",
        allowedRoles: ["admin", "teacher"],
      },
    ],
  },
  {
    labelKey: "adminTools",
    icon: "Settings",
    allowedRoles: ["admin"],
    children: [
      {
        labelKey: "settings",
        icon: "Settings",
        path: "/settings",
        permission: PERMISSIONS.settings.view,
        allowedRoles: ["admin"],
      },
      {
        labelKey: "users",
        icon: "ShieldCheck",
        path: "/admin/users",
        allowedRoles: ["admin"],
      },
      {
        labelKey: "auditLogs",
        icon: "FileText",
        path: "/admin/audit",
        permission: PERMISSIONS.audit.view,
        allowedRoles: ["admin"],
      },
      {
        labelKey: "billing",
        icon: "CreditCard",
        path: "/settings/billing",
        permission: PERMISSIONS.billing.view,
        allowedRoles: ["admin"],
      },
    ],
  },
  {
    labelKey: "aiTools",
    icon: "Sparkles",
    allowedRoles: ["admin", "teacher"],
    children: [
      {
        labelKey: "aiAssistant",
        icon: "Bot",
        path: "/ai-chatbot",
        allowedRoles: ["admin", "teacher"],
      },
      {
        labelKey: "examQuestions",
        icon: "FileText",
        path: "/ai-exam-questions",
        allowedRoles: ["admin", "teacher"],
      },
    ],
  },
];
