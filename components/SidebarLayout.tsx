"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  LayoutDashboard, Users, BookOpen, UserCircle, ClipboardCheck,
  Wallet, Clock, Settings, Menu, X, ShieldCheck, LogOut,
  GraduationCap, DollarSign, Calendar, FileText, Heart,
  ChevronDown, ChevronRight, CreditCard, Sparkles,
} from "lucide-react";
import MobileBottomNav from "./MobileBottomNav";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [role, setRole] = useState<string>("loading");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    academic: true,
    finance: true,
    adminTools: true,
    operations: true,
    staff: true,
  });

  useEffect(() => {
    fetch("/api/users/get", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setRole(data.role || "teacher"))
      .catch(() => setRole("teacher"));
  }, []);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const menuGroups = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      items: [
        {
          name: "Command Center",
          icon: LayoutDashboard,
          path: "/dashboard",
          allowed: ["admin", "teacher", "accountant"],
        },
      ],
      allowed: ["admin", "teacher", "accountant"],
      key: null,
    },
    {
      title: "Academic",
      icon: BookOpen,
      items: [
        { name: "Students", icon: Users, path: "/students", allowed: ["admin", "teacher"] },
        { name: "Classes", icon: GraduationCap, path: "/classes", allowed: ["admin"] },
        { name: "Manage Syllabus", icon: FileText, path: "/admin/syllabus", allowed: ["admin"] },
        { name: "Academic Year", icon: Calendar, path: "/admin/academic-year", allowed: ["admin"] },
      ],
      allowed: ["admin", "teacher"],
      key: "academic",
    },
    {
      title: "Finance",
      icon: DollarSign,
      items: [
        { name: "Fees Collection", icon: Wallet, path: "/fees", allowed: ["admin", "accountant"] },
        { name: "Ledger", icon: ClipboardCheck, path: "/ledger", allowed: ["admin", "accountant"] },
      ],
      allowed: ["admin", "accountant"],
      key: "finance",
    },
    {
      title: "Operations",
      icon: Clock,
      items: [
        { name: "Attendance", icon: ClipboardCheck, path: "/attendance", allowed: ["admin", "teacher"] },
        { name: "Time Table", icon: Clock, path: "/timetable", allowed: ["admin", "teacher"] },
        { name: "AI Timetable", icon: Sparkles, path: "/ai-timetable", allowed: ["admin", "teacher"] }, // <-- نیا لنک
      ],
      allowed: ["admin", "teacher"],
      key: "operations",
    },
    {
      title: "Staff",
      icon: UserCircle,
      items: [
        { name: "Staff Management", icon: UserCircle, path: "/staff", allowed: ["admin"] },
        { name: "Manage Parents", icon: Heart, path: "/admin/parents", allowed: ["admin"] },
      ],
      allowed: ["admin"],
      key: "staff",
    },
    {
      title: "Admin Tools",
      icon: Settings,
      items: [
        { name: "Admin Settings", icon: Settings, path: "/settings", allowed: ["admin"] },
        { name: "Manage Users", icon: ShieldCheck, path: "/admin/users", allowed: ["admin"] },
        { name: "Audit Logs", icon: FileText, path: "/admin/audit", allowed: ["admin"] },
        { name: "Billing", icon: CreditCard, path: "/settings/billing", allowed: ["admin"] },
      ],
      allowed: ["admin"],
      key: "adminTools",
    },
  ];

  const visibleGroups = menuGroups.filter((g) => g.allowed.includes(role));

  const handleLogout = async () => {
    await signOut(auth);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen bg-transparent">
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 p-2 glass-card !rounded-xl"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} className="text-slate-700" /> : <Menu size={24} className="text-slate-700" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 flex flex-col transform transition-transform md:relative md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(35px)",
          WebkitBackdropFilter: "blur(35px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "0 36px 36px 0",
        }}
      >
        {/* Logo */}
        <div
          className="h-20 px-6 border-b border-white/10 flex items-center gap-2 cursor-pointer mb-4"
          onClick={() => router.push("/dashboard")}
        >
          <ShieldCheck className="text-primary w-8 h-8" />
          <span className="text-xl font-black text-slate-800">EduPilot</span>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-2 px-4">
          {role === "loading" ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-white/10 rounded w-full"></div>
              <div className="h-8 bg-white/10 rounded w-full"></div>
              <div className="h-8 bg-white/10 rounded w-full"></div>
            </div>
          ) : (
            visibleGroups.map((group) => (
              <div key={group.title} className="mb-2">
                <div
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-white/10 cursor-pointer transition-colors"
                  onClick={() => group.key && toggleGroup(group.key)}
                >
                  <div className="flex items-center gap-2">
                    <group.icon size={18} className="text-primary" />
                    <span className="text-sm font-semibold">{group.title}</span>
                  </div>
                  {group.key && (openGroups[group.key] ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                </div>

                {(!group.key || openGroups[group.key]) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {group.items
                      .filter((i) => i.allowed.includes(role))
                      .map((item) => {
                        const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
                        return (
                          <Link
                            key={item.name}
                            href={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                              isActive
                                ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                                : "text-slate-600 hover:bg-white/10"
                            }`}
                          >
                            <item.icon size={18} />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-50/10 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Secure Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">{children}</div>
        <MobileBottomNav />
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </div>
  );
}
