import { 
  LayoutDashboard, Users, GraduationCap, FileText, ClipboardCheck,
  BarChart3, UserCircle, Briefcase, CalendarDays, BookOpen,
  Wallet, CreditCard, TrendingUp, MessageSquare, Phone, Mail,
  Bus, BedDouble, Package, Sparkles, Bot, ShieldCheck, Settings,
  Activity, Server, Database, FileCheck, DollarSign, PlusCircle,
  Star, Film, Upload, ScanLine, Award, LogOut, ChevronDown,
  ChevronRight, School, Calculator, HelpCircle, Target, Heart
} from "lucide-react";

export interface MenuItem {
  id: string;
  name: string;
  icon: any;
  path: string;
  requiredPermission?: string;
  featureFlag?: string;
  badge?: string;
}

export interface MenuGroup {
  title: string;
  icon: any;
  key: string;
  allowed?: string[];
  items: MenuItem[];
}

export const MENU_CONFIG: MenuGroup[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    key: "dashboard",
    allowed: ["admin", "teacher", "accountant", "principal"],
    items: [
      { id: "main-dashboard", name: "Dashboard Overview", icon: LayoutDashboard, path: "/dashboard", requiredPermission: "dashboard.view" }
    ]
  },
  {
    title: "Students",
    icon: Users,
    key: "students",
    allowed: ["admin", "teacher", "principal"],
    items: [
      { id: "all-students", name: "All Students", icon: Users, path: "/students", requiredPermission: "students.view" },
      { id: "add-student", name: "Add Student", icon: PlusCircle, path: "/students/add", requiredPermission: "students.create" },
      { id: "bulk-import", name: "Bulk Import", icon: Upload, path: "/students/bulk-import", requiredPermission: "students.create" },
      { id: "ocr-import", name: "OCR Import", icon: ScanLine, path: "/students/ocr-admission", requiredPermission: "students.create", featureFlag: "ocrAdmission" },
      { id: "student-360", name: "Student 360", icon: Activity, path: "/students/360", requiredPermission: "students.view" },
      { id: "certificates", name: "Certificates", icon: Award, path: "/admin/certificates", requiredPermission: "students.view" },
      { id: "promotion", name: "Promotion", icon: TrendingUp, path: "/admin/promote", requiredPermission: "students.update" }
    ]
  },
  {
    title: "Academics",
    icon: GraduationCap,
    key: "academics",
    allowed: ["admin", "teacher", "principal"],
    items: [
      { id: "classes", name: "Classes", icon: GraduationCap, path: "/classes", requiredPermission: "students.view" },
      { id: "sections", name: "Sections", icon: School, path: "/admin/sections", requiredPermission: "students.view" },
      { id: "subjects", name: "Subjects", icon: BookOpen, path: "/admin/subjects", requiredPermission: "students.view" },
      { id: "timetable", name: "Timetable", icon: CalendarDays, path: "/timetable", requiredPermission: "attendance.view" },
      { id: "exams", name: "Exams", icon: FileText, path: "/marks", requiredPermission: "exams.view" },
      { id: "results", name: "Results", icon: BarChart3, path: "/result", requiredPermission: "exams.view" },
      { id: "question-bank", name: "Question Bank", icon: HelpCircle, path: "/teacher/question-bank", requiredPermission: "exams.create", featureFlag: "questionBank" }
    ]
  },
  {
    title: "Teachers",
    icon: UserCircle,
    key: "teachers",
    allowed: ["admin", "principal", "hr"],
    items: [
      { id: "staff", name: "Staff", icon: UserCircle, path: "/staff", requiredPermission: "staff.view" },
      { id: "departments", name: "Departments", icon: Briefcase, path: "/admin/departments", requiredPermission: "staff.view" },
      { id: "leave", name: "Leave", icon: CalendarDays, path: "/leave-requests", requiredPermission: "staff.view" },
      { id: "performance", name: "Performance", icon: Target, path: "/admin/performance", requiredPermission: "staff.view" }
    ]
  },
  {
    title: "Teaching Tools",
    icon: BookOpen,
    key: "teaching-tools",
    allowed: ["admin", "teacher"],
    items: [
      { id: "homework", name: "Homework", icon: FileText, path: "/teacher/homework", requiredPermission: "students.view" },
      { id: "assignments", name: "Assignments", icon: FileText, path: "/teacher/assignments", requiredPermission: "students.view", featureFlag: "assignments" },
      { id: "quizzes", name: "Quizzes", icon: ClipboardCheck, path: "/teacher/quizzes", requiredPermission: "students.view", featureFlag: "quizzes" },
      { id: "lesson-plans", name: "Lesson Plans", icon: CalendarDays, path: "/teacher/lesson-plans", requiredPermission: "students.view", featureFlag: "lessonPlans" },
      { id: "video-lectures", name: "Video Lectures", icon: Film, path: "/teacher/video-lectures", requiredPermission: "students.view", featureFlag: "videoLectures" },
      { id: "book-center", name: "Book Center", icon: BookOpen, path: "/teacher/book-center", requiredPermission: "students.view", featureFlag: "bookCenter" }
    ]
  },
  {
    title: "Finance",
    icon: Wallet,
    key: "finance",
    allowed: ["admin", "accountant", "principal"],
    items: [
      { id: "fees", name: "Fees", icon: Wallet, path: "/fees", requiredPermission: "fees.view" },
      { id: "ledger", name: "Ledger", icon: BookOpen, path: "/ledger", requiredPermission: "fees.view" },
      { id: "expenses", name: "Expenses", icon: DollarSign, path: "/admin/expenses", requiredPermission: "fees.view" },
      { id: "invoices", name: "Invoices", icon: FileText, path: "/admin/invoices", requiredPermission: "fees.view" },
      { id: "reports", name: "Reports", icon: BarChart3, path: "/admin/finance-reports", requiredPermission: "fees.view" }
    ]
  },
  {
    title: "Communication",
    icon: MessageSquare,
    key: "communication",
    allowed: ["admin", "teacher", "principal"],
    items: [
      { id: "announcements", name: "Announcements", icon: MessageSquare, path: "/admin/announcements", requiredPermission: "settings.view" },
      { id: "sms", name: "SMS", icon: Phone, path: "/admin/sms", requiredPermission: "settings.view", featureFlag: "sms" },
      { id: "whatsapp", name: "WhatsApp", icon: Phone, path: "/admin/whatsapp", requiredPermission: "settings.view", featureFlag: "whatsapp" },
      { id: "email", name: "Email", icon: Mail, path: "/admin/email", requiredPermission: "settings.view" }
    ]
  },
  {
    title: "Operations",
    icon: Settings,
    key: "operations",
    allowed: ["admin", "principal"],
    items: [
      { id: "attendance", name: "Attendance", icon: ClipboardCheck, path: "/attendance", requiredPermission: "attendance.view" },
      { id: "transport", name: "Transport", icon: Bus, path: "/admin/buses", requiredPermission: "settings.view", featureFlag: "transport" },
      { id: "hostel", name: "Hostel", icon: BedDouble, path: "/admin/hostel", requiredPermission: "settings.view", featureFlag: "hostel" },
      { id: "inventory", name: "Inventory", icon: Package, path: "/admin/inventory", requiredPermission: "settings.view" }
    ]
  },
  {
    title: "AI Center",
    icon: Sparkles,
    key: "ai-center",
    allowed: ["admin", "teacher", "principal"],
    items: [
      { id: "ai-assistant", name: "AI Assistant", icon: Bot, path: "/ai-chatbot", requiredPermission: "dashboard.view", featureFlag: "aiAssistant" },
      { id: "ai-teacher", name: "AI Teacher", icon: Sparkles, path: "/ai/teacher", requiredPermission: "students.view", featureFlag: "aiTeacher" },
      { id: "ai-student", name: "AI Student", icon: Sparkles, path: "/ai/student", requiredPermission: "students.view", featureFlag: "aiStudent" },
      { id: "ai-parent", name: "AI Parent", icon: Heart, path: "/ai/parent", requiredPermission: "parents.view", featureFlag: "aiParent" },
      { id: "ai-analytics", name: "AI Analytics", icon: BarChart3, path: "/ai/analytics", requiredPermission: "dashboard.view", featureFlag: "aiAnalytics" },
      { id: "ai-risk", name: "AI Risk Engine", icon: Activity, path: "/ai/risk", requiredPermission: "students.view", featureFlag: "aiRiskEngine" },
      { id: "ai-career", name: "AI Career Counselor", icon: Target, path: "/ai/career", requiredPermission: "students.view", featureFlag: "aiCareerCounselor" },
      { id: "ai-exam", name: "AI Exam Generator", icon: FileText, path: "/ai-exam-questions", requiredPermission: "exams.create", featureFlag: "aiExamGenerator" },
      { id: "ai-timetable", name: "AI Timetable", icon: CalendarDays, path: "/ai-timetable", requiredPermission: "settings.update", featureFlag: "aiTimetable" },
      { id: "ai-comments", name: "AI Report Comments", icon: FileText, path: "/ai/report-comments", requiredPermission: "exams.view" }
    ]
  },
  {
    title: "Administration",
    icon: ShieldCheck,
    key: "administration",
    allowed: ["admin"],
    items: [
      { id: "users", name: "Users", icon: Users, path: "/admin/users", requiredPermission: "settings.manage" },
      { id: "roles", name: "Roles & Permissions", icon: ShieldCheck, path: "/admin/roles", requiredPermission: "settings.manage" },
      { id: "feature-flags", name: "Feature Flags", icon: Settings, path: "/admin/feature-flags", requiredPermission: "settings.manage" },
      { id: "audit-logs", name: "Audit Logs", icon: FileCheck, path: "/admin/audit", requiredPermission: "audit.view" },
      { id: "billing", name: "Billing", icon: CreditCard, path: "/settings/billing", requiredPermission: "billing.view" },
      { id: "white-label", name: "White Label", icon: Star, path: "/settings/whitelabel", requiredPermission: "settings.manage" },
      { id: "settings", name: "Settings", icon: Settings, path: "/settings", requiredPermission: "settings.view" }
    ]
  },
  {
    title: "Super Admin",
    icon: Server,
    key: "super-admin",
    allowed: ["super_admin", "platform_owner"],
    items: [
      { id: "tenants", name: "Tenants", icon: School, path: "/super-admin/tenants", requiredPermission: "settings.manage" },
      { id: "plans", name: "Plans", icon: CreditCard, path: "/super-admin/plans", requiredPermission: "settings.manage" },
      { id: "usage", name: "Usage", icon: Activity, path: "/super-admin/usage", requiredPermission: "settings.manage" },
      { id: "system-health", name: "System Health", icon: Server, path: "/super-admin/health", requiredPermission: "settings.manage" },
      { id: "global-analytics", name: "Global Analytics", icon: BarChart3, path: "/super-admin/analytics", requiredPermission: "settings.manage" },
      { id: "backups", name: "Backups", icon: Database, path: "/super-admin/backups", requiredPermission: "settings.manage" }
    ]
  }
];

export const getFilteredMenu = (
  userRole: string,
  userPermissions: string[],
  enabledFeatureFlags: Record<string, boolean> = {}
) => {
  return MENU_CONFIG
    .filter(group => {
      if (!group.allowed) return true;
      return group.allowed.includes(userRole);
    })
    .map(group => {
      const filteredItems = group.items.filter(item => {
        // Check permission
        if (item.requiredPermission && !userPermissions.includes(item.requiredPermission)) {
          return false;
        }
        // Check feature flag
        if (item.featureFlag && enabledFeatureFlags[item.featureFlag] === false) {
          return false;
        }
        return true;
      });

      return { ...group, items: filteredItems };
    })
    .filter(group => group.items.length > 0);
};

export const getAllPermissions = () => {
  const permissions = new Set<string>();
  MENU_CONFIG.forEach(group => {
    group.items.forEach(item => {
      if (item.requiredPermission) {
        permissions.add(item.requiredPermission);
      }
    });
  });
  return Array.from(permissions);
};
