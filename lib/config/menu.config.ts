import { 
  LayoutDashboard, Users, BookOpen, UserCircle, ClipboardCheck,
  Wallet, Clock, Settings, ShieldCheck, GraduationCap, 
  DollarSign, Calendar, FileText, Heart, CreditCard, Sparkles, 
  Bus, CalendarDays, Bot, Film, Star, PlusCircle
} from 'lucide-react';

export interface MenuItem {
  id: string;
  name: string;
  icon: any;
  path: string;
  requiredPermission?: string;
  featureFlag?: string;
}

export interface MenuGroup {
  title: string;
  icon: any;
  key: string | null;
  items: MenuItem[];
}

// 1. Define All Menu Items with Permissions & Feature Flags
export const MENU_CONFIG: MenuGroup[] = [
  {
    title: 'Command Center',
    icon: LayoutDashboard,
    key: null,
    items: [
      { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', requiredPermission: 'dashboard.view' },
    ]
  },
  {
    title: 'Academic',
    icon: BookOpen,
    key: 'academic',
    items: [
      { id: 'students', name: 'Students', icon: Users, path: '/students', requiredPermission: 'students.view' },
      { id: 'classes', name: 'Classes & Sections', icon: GraduationCap, path: '/classes', requiredPermission: 'students.view' },
      { id: 'syllabus', name: 'Syllabus', icon: FileText, path: '/admin/syllabus', requiredPermission: 'students.view' },
      { id: 'academic-year', name: 'Academic Year', icon: Calendar, path: '/admin/academic-year', requiredPermission: 'settings.view' },
      { id: 'exams', name: 'Exams & Marks', icon: ClipboardCheck, path: '/marks', requiredPermission: 'exams.view' },
      { id: 'results', name: 'Results', icon: GraduationCap, path: '/result', requiredPermission: 'exams.view' },
    ]
  },
  {
    title: 'Finance',
    icon: DollarSign,
    key: 'finance',
    items: [
      { id: 'fees', name: 'Fee Management', icon: Wallet, path: '/fees', requiredPermission: 'fees.view' },
      { id: 'ledger', name: 'Ledger', icon: ClipboardCheck, path: '/ledger', requiredPermission: 'fees.view' },
    ]
  },
  {
    title: 'Operations',
    icon: Clock,
    key: 'operations',
    items: [
      { id: 'attendance', name: 'Attendance', icon: ClipboardCheck, path: '/attendance', requiredPermission: 'attendance.view' },
      { id: 'timetable', name: 'Timetable', icon: Clock, path: '/timetable', requiredPermission: 'attendance.view' },
      { id: 'ai-timetable', name: 'AI Timetable', icon: Sparkles, path: '/ai-timetable', requiredPermission: 'settings.view', featureFlag: 'aiTimetable' },
      { id: 'buses', name: 'Transport', icon: Bus, path: '/admin/buses', requiredPermission: 'settings.view', featureFlag: 'transport' },
    ]
  },
  {
    title: 'Staff & HR',
    icon: UserCircle,
    key: 'staff',
    items: [
      { id: 'staff', name: 'Staff Management', icon: UserCircle, path: '/staff', requiredPermission: 'staff.view' },
      { id: 'parents', name: 'Parents', icon: Heart, path: '/admin/parents', requiredPermission: 'parents.view' },
      { id: 'leaves', name: 'Leave Requests', icon: CalendarDays, path: '/leave-requests', requiredPermission: 'staff.view' },
      { id: 'admissions', name: 'Admissions', icon: FileText, path: '/admin/admissions', requiredPermission: 'students.create' },
    ]
  },
  {
    title: 'Teacher Tools',
    icon: BookOpen,
    key: 'teacher',
    items: [
      { id: 'homework', name: 'Homework', icon: FileText, path: '/teacher/homework', requiredPermission: 'students.view' },
      { id: 'assignments', name: 'Assignments', icon: FileText, path: '/teacher/assignments', requiredPermission: 'students.view', featureFlag: 'assignments' },
      { id: 'quizzes', name: 'Quizzes', icon: FileText, path: '/teacher/quizzes', requiredPermission: 'students.view', featureFlag: 'quizzes' },
      { id: 'lesson-plans', name: 'Lesson Plans', icon: Calendar, path: '/teacher/lesson-plans', requiredPermission: 'students.view', featureFlag: 'lessonPlans' },
      { id: 'behavior', name: 'Behavior Points', icon: PlusCircle, path: '/teacher/behavior', requiredPermission: 'students.view', featureFlag: 'behavior' },
    ]
  },
  {
    title: 'AI Tools',
    icon: Sparkles,
    key: 'ai',
    items: [
      { id: 'ai-chatbot', name: 'AI Assistant', icon: Bot, path: '/ai-chatbot', requiredPermission: 'dashboard.view', featureFlag: 'aiAssistant' },
      { id: 'ai-exam', name: 'AI Exam Generator', icon: FileText, path: '/ai-exam-questions', requiredPermission: 'exams.view', featureFlag: 'aiExamGenerator' },
      { id: 'ai-book', name: 'Smart Book Center', icon: BookOpen, path: '/ai/smart-book-center', requiredPermission: 'students.view' },
      { id: 'ai-comments', name: 'AI Report Comments', icon: FileText, path: '/ai/report-comments', requiredPermission: 'exams.view' },
    ]
  },
  {
    title: 'Administration',
    icon: Settings,
    key: 'admin',
    items: [
      { id: 'settings', name: 'Settings', icon: Settings, path: '/settings', requiredPermission: 'settings.view' },
      { id: 'users', name: 'Users & Roles', icon: ShieldCheck, path: '/admin/users', requiredPermission: 'settings.manage' },
      { id: 'audit', name: 'Audit Logs', icon: FileText, path: '/admin/audit', requiredPermission: 'audit.view' },
      { id: 'billing', name: 'Billing', icon: CreditCard, path: '/settings/billing', requiredPermission: 'billing.view' },
      { id: 'whitelabel', name: 'White Label', icon: Star, path: '/settings/whitelabel', requiredPermission: 'settings.manage' },
      { id: 'feature-flags', name: 'Feature Flags', icon: Settings, path: '/admin/feature-flags', requiredPermission: 'settings.manage' },
    ]
  }
];

// 2. Helper Function to Filter Menu Based on Permissions & Feature Flags
export const getFilteredMenu = (
  userPermissions: string[], 
  enabledFeatureFlags: Record<string, boolean> = {}
) => {
  return MENU_CONFIG.map(group => {
    const filteredItems = group.items.filter(item => {
      // Check Permission
      if (item.requiredPermission && !userPermissions.includes(item.requiredPermission)) {
        return false;
      }
      // Check Feature Flag
      if (item.featureFlag && enabledFeatureFlags[item.featureFlag] === false) {
        return false;
      }
      return true;
    });

    return { ...group, items: filteredItems };
  }).filter(group => group.items.length > 0); // Remove empty groups
};
