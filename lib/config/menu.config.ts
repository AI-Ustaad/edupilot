export interface MenuItem {
  id: string;

  title: string;

  href: string;

  permission: string;

  feature?: string;

  plans?: string[];
}

export const MENU_CONFIG: MenuItem[] = [
  {
    id: "dashboard",
    title: "dashboard",
    href: "/dashboard",
    permission: "dashboard.view",
  },

  {
    id: "students",
    title: "students",
    href: "/students",
    permission: "students.view",
    feature: "students",
  },

  {
    id: "attendance",
    title: "attendance",
    href: "/attendance",
    permission: "attendance.view",
    feature: "attendance",
  },

  {
    id: "fees",
    title: "fees",
    href: "/fees",
    permission: "fees.view",
    feature: "fees",
  },

  {
    id: "staff",
    title: "staff",
    href: "/staff",
    permission: "staff.view",
    feature: "staff",
  },

  {
    id: "billing",
    title: "billing",
    href: "/settings/billing",
    permission: "billing.view",
    feature: "billing",
    plans: ["basic", "pro", "enterprise"],
  },

  {
    id: "ai-assistant",
    title: "aiAssistant",
    href: "/ai-chatbot",
    permission: "dashboard.view",
    feature: "aiAssistant",
    plans: ["basic", "pro", "enterprise"],
  },

  {
    id: "ai-timetable",
    title: "aiTimetable",
    href: "/ai-timetable",
    permission: "dashboard.view",
    feature: "aiTimetable",
    plans: ["basic", "pro", "enterprise"],
  },
];
