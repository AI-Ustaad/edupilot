"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  LayoutDashboard, Users, BookOpen, UserCircle, ClipboardCheck,
  Wallet, Clock, Settings, Menu, X, ShieldCheck, LogOut,
  GraduationCap, DollarSign, Calendar, FileText, Heart,
  ChevronDown, ChevronRight, CreditCard, Sparkles, Bus, CalendarDays, Bot,
  Send, Star, PlusCircle,
} from "lucide-react";
import MobileBottomNav from "./MobileBottomNav";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/context/AuthContext";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { hasAnyPermission } from "@/lib/auth/client-rbac";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { user } = useAuth();
  const role = user?.role || "";

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    academic: true, finance: true, adminTools: true, operations: true, staff: true, aiTools: true,
  });

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const menuGroups = [
    {
      title: t("commandCenter"),
      icon: LayoutDashboard,
      key: null,
      items: [
        { name: t("commandCenter"), icon: LayoutDashboard, path: "/dashboard", permissions: [], allowed: ["superAdmin", "admin", "teacher", "accountant", "parent", "student"] },
      ],
    },
    {
      title: t("academic"),
      icon: BookOpen,
      key: "academic",
      items: [
        { name: t("students"), icon: Users, path: "/students", permissions: [PERMISSIONS.students.view] },
        { name: t("classes"), icon: GraduationCap, path: "/classes", permissions: [PERMISSIONS.settings.view] },
      ],
    },
    // ... (باقی مینیو گروپس اسی فارمیٹ میں رکھیں)
  ];

  // ... (باقی فنکشنز handleLogout وغیرہ یہاں موجود رہیں گے)

  return (
    <div className="flex h-screen bg-white">
      {/* سائیڈ بار کا باقی کوڈ یہاں رہے گا */}
      {children}
    </div>
  );
}
