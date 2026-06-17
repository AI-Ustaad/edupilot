// services/menu.service.ts

import {
  LayoutDashboard, Users, UserPlus, Upload, ScanLine, GraduationCap,
  ClipboardCheck, CalendarDays, Clock3, Wallet, FileSpreadsheet, Briefcase,
  BookOpen, BookMarked, FileQuestion, Award, Brain, Bot, MessageSquare,
  School, Bus, HeartHandshake, Settings, Shield, BarChart3, Database,
  CreditCard, Sparkles, Video, Library, Bell,
} from "lucide-react";

export const DEFAULT_MENU = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    permission: "dashboard.view",
  },
  {
    title: "Students",
    icon: Users,
    children: [
      { title: "All Students", href: "/students", icon: Users, permission: "students.view" },
      { title: "Add Student", href: "/students/add", icon: UserPlus, permission: "students.create" },
      { title: "Bulk Import", href: "/students/bulk", icon: Upload, permission: "students.bulkImport" },
      { title: "OCR Admission", href: "/students/ocr-admission", icon: ScanLine, permission: "students.ocr" },
      { title: "Student 360", href: "/students/360", icon: Sparkles, permission: "students.analytics" },
      { title: "Risk Prediction", href: "/students/risk", icon: Brain, permission: "students.analytics" },
    ],
  },
  {
    title: "Academic",
    icon: GraduationCap,
    children: [
      { title: "Classes", href: "/classes", icon: GraduationCap, permission: "classes.view" },
      { title: "Attendance", href: "/attendance", icon: ClipboardCheck, permission: "attendance.view" },
      { title: "Timetable", href: "/timetable", icon: CalendarDays, permission: "timetable.view" },
      { title: "Marks", href: "/marks", icon: FileSpreadsheet, permission: "marks.view" },
      { title: "Results", href: "/result", icon: Award, permission: "results.view" },
      { title: "Syllabus", href: "/syllabus", icon: BookOpen, permission: "syllabus.view" },
      { title: "Academic Year", href: "/admin/academic-year", icon: CalendarDays, permission: "academicYear.manage" },
    ],
  },
  {
    title: "Teachers",
    icon: Briefcase,
    children: [
      { title: "Staff", href: "/staff", icon: Briefcase, permission: "staff.view" },
      { title: "Staff Profile", href: "/staff-profile", icon: Users, permission: "staff.view" },
      { title: "Leave Requests", href: "/leave-requests", icon: Clock3, permission: "leave.manage" },
      { title: "Lesson Plans", href: "/teacher/lesson-plans", icon: BookMarked, permission: "lessonPlans.manage" },
      { title: "Homework", href: "/teacher/homework", icon: BookOpen, permission: "homework.manage" },
      { title: "Assignments", href: "/teacher/assignments", icon: FileSpreadsheet, permission: "assignments.manage" },
      { title: "Quizzes", href: "/teacher/quizzes", icon: FileQuestion, permission: "quizzes.manage" },
      { title: "Exam Center", href: "/teacher/exam-center", icon: Award, permission: "exams.manage" },
      { title: "Video Lectures", href: "/teacher/video-lectures", icon: Video, permission: "videoLectures.manage" },
      { title: "Book Center", href: "/teacher/book-center", icon: Library, permission: "books.manage" },
    ],
  },
  {
    title: "Finance",
    icon: Wallet,
    children: [
      { title: "Fees", href: "/fees", icon: Wallet, permission: "fees.view" },
      { title: "Ledger", href: "/ledger", icon: FileSpreadsheet, permission: "ledger.view" },
      { title: "Billing", href: "/settings/billing", icon: CreditCard, permission: "billing.view" },
    ],
  },
  {
    title: "AI Center",
    icon: Bot,
    children: [
      { title: "AI Chatbot", href: "/ai-chatbot", icon: Bot, permission: "ai.chat" },
      { title: "AI Timetable", href: "/ai-timetable", icon: CalendarDays, permission: "ai.timetable" },
      { title: "AI Exam Generator", href: "/ai-exam-questions", icon: FileQuestion, permission: "ai.examGenerator" },
      { title: "Study Center", href: "/study-center", icon: Brain, permission: "ai.study" },
    ],
  },
  {
    title: "Parents",
    icon: HeartHandshake,
    children: [
      { title: "Parents", href: "/admin/parents", icon: HeartHandshake, permission: "parents.view" },
      { title: "Communication", href: "/parent/chat", icon: MessageSquare, permission: "parents.chat" },
    ],
  },
  {
    title: "Transport",
    icon: Bus,
    children: [
      { title: "Buses", href: "/admin/buses", icon: Bus, permission: "buses.manage" },
    ],
  },
  {
    title: "Analytics",
    icon: BarChart3,
    children: [
      { title: "Analytics", href: "/admin/analytics", icon: BarChart3, permission: "analytics.view" },
      { title: "Audit Logs", href: "/admin/audit", icon: Shield, permission: "audit.view" },
      { title: "Super Analytics", href: "/super-admin/analytics", icon: Database, permission: "analytics.global" },
    ],
  },
  {
    title: "Administration",
    icon: School,
    children: [
      { title: "Users", href: "/admin/users", icon: Users, permission: "users.manage" },
      { title: "Admissions", href: "/admin/admissions", icon: UserPlus, permission: "admissions.manage" },
      { title: "Promotions", href: "/admin/promote", icon: GraduationCap, permission: "students.promote" },
      { title: "Menu Manager", href: "/admin/menu-manager", icon: Settings, permission: "menu.manage" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    children: [
      { title: "General Settings", href: "/settings", icon: Settings, permission: "settings.view" },
      { title: "Addons", href: "/settings/addons", icon: Sparkles, permission: "addons.manage" },
      { title: "White Label", href: "/settings/whitelabel", icon: Bell, permission: "whitelabel.manage" },
    ],
  },
];
