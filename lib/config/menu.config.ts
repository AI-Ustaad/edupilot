// lib/config/menu.config.ts

import { 
  LayoutDashboard, Users, UserPlus, Upload, ScanLine, Sparkles, Award, GraduationCap, 
  BookOpen, Layers, Library, CalendarDays, ClipboardCheck, FileQuestion, Database, 
  UserCircle, Briefcase, Clock, TrendingUp, FileText, Video, DollarSign, CreditCard, 
  Receipt, PieChart, Megaphone, MessageSquare, MessageCircle, Mail, Bus, Home, Box, 
  Bot, Brain, ShieldCheck, Settings, ToggleRight, Activity, Star, Server, Globe, 
  HardDrive, Building2, Stethoscope, Scale, FileSymlink, Network, Banknote, CalendarCheck
} from 'lucide-react';

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
  key: string | null;
  items: MenuItem[];
}

export const MENU_CONFIG: MenuGroup[] = [
  {
    title: 'Command Center',
    icon: LayoutDashboard,
    key: 'dashboard',
    items: [
      { id: 'main-dashboard', name: 'Dashboard Overview', icon: LayoutDashboard, path: '/dashboard', requiredPermission: 'analytics.view' },
      { id: 'system-analytics', name: 'Advanced Analytics', icon: PieChart, path: '/analytics', requiredPermission: 'analytics.view', featureFlag: 'advancedAnalytics' },
    ]
  },
  {
    title: 'Students Hub',
    icon: Users,
    key: 'students',
    items: [
      { id: 'all-students', name: 'All Students', icon: Users, path: '/students', requiredPermission: 'students.view' },
      { id: 'add-student', name: 'Add Student', icon: UserPlus, path: '/students/add', requiredPermission: 'students.create' },
      { id: 'bulk-import', name: 'Bulk Import', icon: Upload, path: '/students/bulk-import', requiredPermission: 'students.create' },
      { id: 'ocr-import', name: 'Smart OCR Admission', icon: ScanLine, path: '/students/ocr-admission', requiredPermission: 'students.create', featureFlag: 'ocrAdmission', badge: 'AI' },
      { id: 'student-360', name: 'Student 360 View', icon: Sparkles, path: '/students/360', requiredPermission: 'students.view' },
      { id: 'promotions', name: 'Promotions & Transfers', icon: TrendingUp, path: '/admin/promote', requiredPermission: 'students.manage' },
      { id: 'certificates', name: 'Certificates Generator', icon: Award, path: '/admin/certificates', requiredPermission: 'students.manage' },
      { id: 'health-records', name: 'Health Records', icon: Stethoscope, path: '/students/health', requiredPermission: 'students.view', featureFlag: 'healthModule' },
      { id: 'discipline', name: 'Disciplinary Records', icon: Scale, path: '/students/discipline', requiredPermission: 'students.manage' },
      { id: 'alumni', name: 'Alumni Directory', icon: GraduationCap, path: '/students/alumni', requiredPermission: 'students.view', featureFlag: 'alumni' },
    ]
  },
  {
    title: 'Academics',
    icon: GraduationCap,
    key: 'academics',
    items: [
      { id: 'classes', name: 'Classes & Streams', icon: GraduationCap, path: '/classes', requiredPermission: 'academics.view' },
      { id: 'sections', name: 'Sections / Batches', icon: Layers, path: '/admin/sections', requiredPermission: 'academics.view' },
      { id: 'subjects', name: 'Subjects Management', icon: BookOpen, path: '/admin/subjects', requiredPermission: 'academics.view' },
      { id: 'syllabus', name: 'Syllabus Tracker', icon: FileSymlink, path: '/admin/syllabus', requiredPermission: 'academics.view' },
      { id: 'timetable', name: 'Timetable', icon: CalendarDays, path: '/timetable', requiredPermission: 'timetable.view' },
      { id: 'academic-year', name: 'Academic Year Setup', icon: CalendarCheck, path: '/admin/academic-year', requiredPermission: 'academics.manage' },
    ]
  },
  {
    title: 'Examinations',
    icon: ClipboardCheck,
    key: 'exams',
    items: [
      { id: 'exam-setup', name: 'Exam Setup', icon: ClipboardCheck, path: '/admin/exams/setup', requiredPermission: 'exams.manage' },
      { id: 'marks-entry', name: 'Marks Entry', icon: FileText, path: '/marks', requiredPermission: 'exams.update' },
      { id: 'results', name: 'Results & Transcripts', icon: Award, path: '/result', requiredPermission: 'exams.view' },
      { id: 'gradebook', name: 'Master Gradebook', icon: Database, path: '/admin/gradebook', requiredPermission: 'exams.view' },
      { id: 'question-bank', name: 'Question Bank', icon: FileQuestion, path: '/teacher/question-bank', requiredPermission: 'exams.create', featureFlag: 'questionBank' },
    ]
  },
  {
    title: 'Staff & HR',
    icon: UserCircle,
    key: 'staff',
    items: [
      { id: 'staff-directory', name: 'Staff Directory', icon: UserCircle, path: '/staff', requiredPermission: 'staff.view' },
      { id: 'departments', name: 'Departments', icon: Building2, path: '/admin/departments', requiredPermission: 'staff.manage' },
      { id: 'staff-attendance', name: 'Staff Attendance', icon: Clock, path: '/staff/attendance', requiredPermission: 'staff.view' },
      { id: 'leave-requests', name: 'Leave Requests', icon: CalendarDays, path: '/leave-requests', requiredPermission: 'leave.manage' },
      { id: 'payroll', name: 'Payroll Management', icon: Banknote, path: '/admin/payroll', requiredPermission: 'payroll.manage', featureFlag: 'payroll' },
      { id: 'performance', name: 'Performance Reviews', icon: Activity, path: '/admin/performance', requiredPermission: 'staff.manage' },
      { id: 'parents', name: 'Parents Database', icon: Network, path: '/admin/parents', requiredPermission: 'parents.view' },
    ]
  },
  {
    title: 'Finance & Accounts',
    icon: DollarSign,
    key: 'finance',
    items: [
      { id: 'fee-collection', name: 'Fee Collection', icon: Wallet, path: '/fees', requiredPermission: 'fees.collect' },
      { id: 'fee-structures', name: 'Fee Structures', icon: Layers, path: '/admin/fee-structures', requiredPermission: 'fees.manage' },
      { id: 'invoices', name: 'Invoices', icon: Receipt, path: '/admin/invoices', requiredPermission: 'fees.view' },
      { id: 'discounts', name: 'Discounts & Scholarships', icon: Award, path: '/admin/discounts', requiredPermission: 'fees.manage' },
      { id: 'ledger', name: 'Student Ledger', icon: BookOpen, path: '/ledger', requiredPermission: 'ledger.view' },
      { id: 'expenses', name: 'Expenses Tracker', icon: CreditCard, path: '/admin/expenses', requiredPermission: 'finance.manage' },
      { id: 'finance-reports', name: 'Financial Reports', icon: PieChart, path: '/admin/finance-reports', requiredPermission: 'finance.view' },
      { id: 'payment-gateways', name: 'Payment Gateways', icon: Globe, path: '/admin/payment-gateways', requiredPermission: 'finance.manage', featureFlag: 'onlinePayments' },
    ]
  },
  {
    title: 'Teaching Tools',
    icon: Briefcase,
    key: 'teaching',
    items: [
      { id: 'homework', name: 'Homework', icon: FileText, path: '/teacher/homework', requiredPermission: 'homework.view' },
      { id: 'assignments', name: 'Assignments', icon: ClipboardCheck, path: '/teacher/assignments', requiredPermission: 'assignments.view', featureFlag: 'assignments' },
      { id: 'quizzes', name: 'Quizzes', icon: FileQuestion, path: '/teacher/quizzes', requiredPermission: 'quizzes.view', featureFlag: 'quizzes' },
      { id: 'lesson-plans', name: 'Lesson Plans', icon: BookOpen, path: '/teacher/lesson-plans', requiredPermission: 'lessonPlans.view', featureFlag: 'lessonPlans' },
      { id: 'video-lectures', name: 'Video Lectures', icon: Video, path: '/teacher/video-lectures', requiredPermission: 'videoLectures.view', featureFlag: 'videoLectures' },
      { id: 'smart-book', name: 'Smart Book Center', icon: Library, path: '/teacher/book-center', requiredPermission: 'books.view', featureFlag: 'bookCenter' },
    ]
  },
  {
    title: 'Operations',
    icon: Settings,
    key: 'operations',
    items: [
      { id: 'student-attendance', name: 'Student Attendance', icon: ClipboardCheck, path: '/attendance', requiredPermission: 'attendance.view' },
      { id: 'transport', name: 'Transport & Routing', icon: Bus, path: '/admin/buses', requiredPermission: 'operations.view', featureFlag: 'transport' },
      { id: 'hostel', name: 'Hostel Management', icon: Home, path: '/admin/hostel', requiredPermission: 'operations.view', featureFlag: 'hostel' },
      { id: 'inventory', name: 'Inventory & Stock', icon: Box, path: '/admin/inventory', requiredPermission: 'operations.manage', featureFlag: 'inventory' },
    ]
  },
  {
    title: 'Communication',
    icon: MessageSquare,
    key: 'communication',
    items: [
      { id: 'announcements', name: 'Notice Board', icon: Megaphone, path: '/admin/announcements', requiredPermission: 'communication.view' },
      { id: 'sms-center', name: 'SMS Center', icon: MessageSquare, path: '/admin/sms', requiredPermission: 'communication.send', featureFlag: 'sms' },
      { id: 'whatsapp', name: 'WhatsApp Hub', icon: MessageCircle, path: '/admin/whatsapp', requiredPermission: 'communication.send', featureFlag: 'whatsapp' },
      { id: 'email', name: 'Email Campaigns', icon: Mail, path: '/admin/email', requiredPermission: 'communication.send' },
    ]
  },
  {
    title: 'AI Center',
    icon: Bot,
    key: 'ai-center',
    items: [
      { id: 'ai-assistant', name: 'AI Assistant', icon: Bot, path: '/ai-chatbot', requiredPermission: 'ai.view', featureFlag: 'aiAssistant', badge: 'Pro' },
      { id: 'ai-exam-gen', name: 'AI Exam Generator', icon: Brain, path: '/ai-exam-questions', requiredPermission: 'ai.manage', featureFlag: 'aiExamGenerator', badge: 'Pro' },
      { id: 'ai-timetable', name: 'AI Timetable Maker', icon: CalendarDays, path: '/ai-timetable', requiredPermission: 'ai.manage', featureFlag: 'aiTimetable', badge: 'Pro' },
      { id: 'ai-comments', name: 'AI Report Comments', icon: FileText, path: '/ai/report-comments', requiredPermission: 'ai.view', featureFlag: 'aiComments' },
      { id: 'ai-risk', name: 'AI Risk Engine', icon: Activity, path: '/ai/risk', requiredPermission: 'ai.view', featureFlag: 'aiRiskEngine', badge: 'Enterprise' },
      { id: 'ai-career', name: 'AI Career Counselor', icon: TrendingUp, path: '/ai/career', requiredPermission: 'ai.view', featureFlag: 'aiCareerCounselor' },
    ]
  },
  {
    title: 'School Administration',
    icon: ShieldCheck,
    key: 'administration',
    items: [
      { id: 'school-settings', name: 'General Settings', icon: Settings, path: '/settings', requiredPermission: 'settings.view' },
      { id: 'users-roles', name: 'Users & Permissions', icon: Users, path: '/admin/users', requiredPermission: 'settings.manage' },
      { id: 'feature-flags', name: 'Feature Controls', icon: ToggleRight, path: '/admin/feature-flags', requiredPermission: 'settings.manage' },
      { id: 'audit-logs', name: 'Activity & Audit Logs', icon: FileText, path: '/admin/audit', requiredPermission: 'audit.view' },
      { id: 'whitelabel', name: 'Branding & White Label', icon: Star, path: '/settings/whitelabel', requiredPermission: 'settings.manage' },
      { id: 'billing', name: 'School Billing', icon: CreditCard, path: '/settings/billing', requiredPermission: 'billing.view' },
    ]
  },
  {
    title: 'Super Admin (SaaS)',
    icon: Server,
    key: 'super-admin',
    items: [
      { id: 'saas-tenants', name: 'Registered Schools', icon: Building2, path: '/super-admin/tenants', requiredPermission: 'superadmin.access' },
      { id: 'saas-plans', name: 'Subscription Plans', icon: CreditCard, path: '/super-admin/plans', requiredPermission: 'superadmin.access' },
      { id: 'saas-usage', name: 'Global Usage', icon: Activity, path: '/super-admin/usage', requiredPermission: 'superadmin.access' },
      { id: 'saas-health', name: 'System Health', icon: HardDrive, path: '/super-admin/health', requiredPermission: 'superadmin.access' },
      { id: 'saas-analytics', name: 'Global Analytics', icon: Globe, path: '/super-admin/analytics', requiredPermission: 'superadmin.access' },
      { id: 'saas-backups', name: 'Database Backups', icon: Database, path: '/super-admin/backups', requiredPermission: 'superadmin.access' },
    ]
  }
];

export const getFilteredMenu = (
  userRole: string,
  userPermissions: string[],
  enabledFeatureFlags: Record<string, boolean> = {}
) => {
  return MENU_CONFIG.map(group => {
    const filteredItems = group.items.filter(item => {
      // 1. Super Admin Check
      const isSuperAdmin = userPermissions.includes('superadmin.access') || userRole === 'super_admin';
      
      // 2. Feature Flag Check
      if (item.featureFlag && enabledFeatureFlags[item.featureFlag] === false) {
        return false;
      }

      // 3. Permission Check
      if (!isSuperAdmin && item.requiredPermission && !userPermissions.includes(item.requiredPermission)) {
        return false;
      }

      return true;
    });

    return { ...group, items: filteredItems };
  }).filter(group => group.items.length > 0);
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
