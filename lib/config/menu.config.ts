// lib/config/menu.config.ts

import {
  LayoutDashboard, Users, UserPlus, Upload, ScanLine, GraduationCap,
  ClipboardCheck, CalendarDays, Clock3, Wallet, FileSpreadsheet, Briefcase,
  BookOpen, BookMarked, FileQuestion, Award, Brain, Bot, MessageSquare,
  School, Bus, HeartHandshake, Settings, Shield, BarChart3, Database,
  CreditCard, Sparkles, Video, Library, Bell, UserCircle // 🚀 یہ آئیکن مسنگ تھا!
} from "lucide-react";

export const DEFAULT_MENU = [
  {
    title: "Command Center",
    icon: LayoutDashboard,
    href: "/dashboard",
    permission: "dashboard.view",
    allowedRoles: ["superAdmin", "admin", "teacher", "accountant", "parent", "student"]
  },
  {
    title: "Students",
    icon: Users,
    children: [
      { title: "All Students", href: "/students", icon: Users, permission: "students.view" },
      { title: "Add Student", href: "/students/add", icon: UserPlus, permission: "students.create" },
      { title: "Bulk Import", href: "/students/bulk", icon: Upload, permission: "students.create" },
      { title: "OCR Admission", href: "/students/ocr-admission", icon: ScanLine, permission: "students.create" },
      { title: "Student 360", href: "/students/360", icon: Sparkles, permission: "students.view" },
      { title: "Risk Prediction", href: "/students/risk", icon: Brain, allowedRoles: ["superAdmin", "admin", "principal"] },
    ],
  },
  {
    title: "Academic",
    icon: GraduationCap,
    children: [
      { title: "Classes", href: "/classes", icon: GraduationCap, permission: "settings.view" },
      { title: "Attendance", href: "/attendance", icon: ClipboardCheck, permission: "attendance.view" },
      { title: "Timetable", href: "/timetable", icon: CalendarDays, permission: "settings.view" },
      { title: "Marks", href: "/marks", icon: FileSpreadsheet, permission: "students.view" },
      { title: "Results", href: "/result", icon: Award, permission: "students.view" },
      { title: "Syllabus", href: "/syllabus", icon: BookOpen, permission: "settings.view" },
    ],
  },
  {
    title: "Teacher Tools",
    icon: Briefcase,
    children: [
      { title: "Homework", href: "/teacher/homework", icon: BookOpen, allowedRoles: ["superAdmin", "admin", "teacher"] },
      { title: "Lesson Plans", href: "/teacher/lesson-plans", icon: BookMarked, allowedRoles: ["superAdmin", "admin", "teacher"] },
      { title: "Assignments", href: "/teacher/assignments", icon: FileSpreadsheet, allowedRoles: ["superAdmin", "admin", "teacher"] },
      { title: "Quizzes", href: "/teacher/quizzes", icon: FileQuestion, allowedRoles: ["superAdmin", "admin", "teacher"] },
      { title: "Exam Center", href: "/teacher/exam-center", icon: Award, allowedRoles: ["superAdmin", "admin", "teacher"] },
      { title: "Video Lectures", href: "/teacher/video-lectures", icon: Video, allowedRoles: ["superAdmin", "admin", "teacher"] },
      { title: "Book Center", href: "/teacher/manage-books", icon: Library, allowedRoles: ["superAdmin", "admin", "teacher"] },
    ],
  },
  {
    title: "Staff",
    icon: UserCircle,
    children: [
      { title: "Staff Directory", href: "/staff", icon: Users, permission: "staff.view" },
      { title: "Staff Profile", href: "/staff-profile", icon: Briefcase, permission: "staff.view" },
    ],
  },
  {
    title: "Finance",
    icon: Wallet,
    children: [
      { title: "Fees", href: "/fees", icon: Wallet, permission: "finance.view" },
      { title: "Billing", href: "/settings/billing", icon: CreditCard, permission: "finance.view" },
    ],
  },
  {
    title: "AI Tools",
    icon: Bot,
    children: [
      { title: "AI Chatbot", href: "/ai-chatbot", icon: Bot, allowedRoles: ["superAdmin", "admin", "teacher", "principal"] },
      { title: "AI Exam Generator", href: "/ai-exam-questions", icon: FileQuestion, allowedRoles: ["superAdmin", "admin", "teacher"] },
      { title: "AI Timetable", href: "/ai-timetable", icon: CalendarDays, allowedRoles: ["superAdmin", "admin"] },
      { title: "Study Center", href: "/study-center", icon: Brain, allowedRoles: ["superAdmin", "student"] },
    ],
  },
  {
    title: "Administration",
    icon: School,
    children: [
      { title: "Users", href: "/admin/users", icon: Users, permission: "settings.view" },
      { title: "Parents", href: "/admin/parents", icon: HeartHandshake, permission: "settings.view" },
      { title: "Transport", href: "/admin/buses", icon: Bus, permission: "settings.view" },
      { title: "Promotions", href: "/admin/promote", icon: GraduationCap, permission: "settings.view" },
      { title: "Menu Manager", href: "/admin/menu-manager", icon: Settings, allowedRoles: ["superAdmin"] },
      { title: "Academic Year", href: "/admin/academic-year", icon: CalendarDays, permission: "settings.view" },
      { title: "Audit Logs", href: "/admin/audit", icon: Shield, allowedRoles: ["superAdmin"] },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    children: [
      { title: "General Settings", href: "/settings", icon: Settings, permission: "settings.view" },
      { title: "Addons", href: "/settings/addons", icon: Sparkles, allowedRoles: ["superAdmin"] },
      { title: "White Label", href: "/settings/whitelabel", icon: Bell, allowedRoles: ["superAdmin"] },
    ],
  },
];
