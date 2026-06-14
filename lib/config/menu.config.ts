import { MenuGroup } from "@/types/menu";
import { PERMISSIONS } from "@/lib/auth/permissions";

export const DEFAULT_MENU: MenuGroup[] = [
  {
    title: "commandCenter",
    icon: "LayoutDashboard",
    key: null,
    children: [
      {
        name: "commandCenter",
        icon: "LayoutDashboard",
        path: "/dashboard",
        allowedRoles: ["admin", "teacher", "accountant"],
        permission: PERMISSIONS.analytics.view,
      },
    ],
    allowedRoles: ["admin", "teacher", "accountant"],
  },
  {
    title: "academic",
    icon: "BookOpen",
    key: "academic",
    children: [
      {
        name: "students",
        icon: "Users",
        path: "/students",
        allowedRoles: ["admin", "teacher"],
        permission: PERMISSIONS.students.view,
      },
      {
        name: "classes",
        icon: "GraduationCap",
        path: "/classes",
        allowedRoles: ["admin"],
      },
      {
        name: "syllabus",
        icon: "FileText",
        path: "/admin/syllabus",
        allowedRoles: ["admin"],
      },
      {
        name: "academicYear",
        icon: "Calendar",
        path: "/admin/academic-year",
        allowedRoles: ["admin"],
      },
      {
        name: "videoLibrary",
        icon: "Film",
        path: "/video-lectures",
        allowedRoles: ["admin", "teacher", "parent"],
        permission: PERMISSIONS.videoLectures.view,
      },
    ],
    allowedRoles: ["admin", "teacher", "parent"],
  },
  {
    title: "finance",
    icon: "DollarSign",
    key: "finance",
    children: [
      {
        name: "fees",
        icon: "Wallet",
        path: "/fees",
        allowedRoles: ["admin", "accountant"],
        permission: PERMISSIONS.fees.view,
      },
    ],
    allowedRoles: ["admin", "accountant"],
  },
  {
    title: "operations",
    icon: "Clock",
    key: "operations",
    children: [
      {
        name: "attendance",
        icon: "ClipboardCheck",
        path: "/attendance",
        allowedRoles: ["admin", "teacher"],
        permission: PERMISSIONS.attendance.view,
      },
      {
        name: "timetable",
        icon: "Clock",
        path: "/timetable",
        allowedRoles: ["admin", "teacher"],
      },
      {
        name: "aiTimetable",
        icon: "Sparkles",
        path: "/ai-timetable",
        allowedRoles: ["admin", "teacher"],
        featureFlag: "aiTimetable",    // درست
      },
      {
        name: "buses",
        icon: "Bus",
        path: "/admin/buses",
        allowedRoles: ["admin"],
        featureFlag: "transport",      // "buses" کی جگہ "transport"
      },
    ],
    allowedRoles: ["admin", "teacher"],
  },
  {
    title: "staff",
    icon: "UserCircle",
    key: "staff",
    children: [
      {
        name: "staffManagement",
        icon: "UserCircle",
        path: "/staff",
        allowedRoles: ["admin"],
        permission: PERMISSIONS.staff.view,
      },
      {
        name: "parents",
        icon: "Heart",
        path: "/admin/parents",
        allowedRoles: ["admin"],
        permission: PERMISSIONS.parents.view,
      },
      {
        name: "leaveRequests",
        icon: "CalendarDays",
        path: "/leave-requests",
        allowedRoles: ["admin"],
      },
      {
        name: "postHomework",
        icon: "FileText",
        path: "/teacher/homework",
        allowedRoles: ["admin", "teacher"],
      },
      {
        name: "assignments",
        icon: "FileText",
        path: "/teacher/assignments",
        allowedRoles: ["admin", "teacher"],
      },
      {
        name: "quizzes",
        icon: "FileText",
        path: "/teacher/quizzes",
        allowedRoles: ["admin", "teacher"],
      },
      {
        name: "lessonPlans",
        icon: "Calendar",
        path: "/teacher/lesson-plans",
        allowedRoles: ["admin", "teacher"],
      },
      {
        name: "bookCenter",
        icon: "BookOpen",
        path: "/teacher/book-center",
        allowedRoles: ["admin", "teacher"],
      },
      {
        name: "examCenter",
        icon: "FileText",
        path: "/teacher/exam-center",
        allowedRoles: ["admin", "teacher"],
      },
      {
        name: "videoLectures",
        icon: "Film",
        path: "/teacher/video-lectures",
        allowedRoles: ["admin", "teacher"],
      },
      {
        name: "chat",
        icon: "Send",
        path: "/teacher/chat",
        allowedRoles: ["admin", "teacher"],
      },
      {
        name: "admissions",
        icon: "FileText",
        path: "/admin/admissions",
        allowedRoles: ["admin"],
      },
      {
        name: "addSkills",
        icon: "Star",
        path: "/teacher/skills",
        allowedRoles: ["admin", "teacher"],
      },
      {
        name: "behaviorPoints",
        icon: "PlusCircle",
        path: "/teacher/behavior",
        allowedRoles: ["admin", "teacher"],
      },
    ],
    allowedRoles: ["admin"],
  },
  {
    title: "adminTools",
    icon: "Settings",
    key: "adminTools",
    children: [
      {
        name: "settings",
        icon: "Settings",
        path: "/settings",
        allowedRoles: ["admin"],
        permission: PERMISSIONS.settings.view,
      },
      {
        name: "users",
        icon: "ShieldCheck",
        path: "/admin/users",
        allowedRoles: ["admin"],
      },
      {
        name: "auditLogs",
        icon: "FileText",
        path: "/admin/audit",
        allowedRoles: ["admin"],
        permission: PERMISSIONS.audit.view,
      },
      {
        name: "billing",
        icon: "CreditCard",
        path: "/settings/billing",
        allowedRoles: ["admin"],
        permission: PERMISSIONS.subscriptions.view,
      },
    ],
    allowedRoles: ["admin"],
  },
  {
    title: "aiTools",
    icon: "Sparkles",
    key: "aiTools",
    children: [
      {
        name: "aiAssistant",
        icon: "Bot",
        path: "/ai-chatbot",
        allowedRoles: ["admin", "teacher"],
        featureFlag: "aiAssistant",       // "aiChatbot" کی جگہ "aiAssistant"
      },
      {
        name: "examQuestions",
        icon: "FileText",
        path: "/ai-exam-questions",
        allowedRoles: ["admin", "teacher"],
        featureFlag: "aiExamGenerator",   // "aiExams" کی جگہ "aiExamGenerator"
      },
    ],
    allowedRoles: ["admin", "teacher"],
  },
];
