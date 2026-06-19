"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Menu, X, LogOut, ShieldCheck, ChevronDown, ChevronRight } from "lucide-react";
import MobileBottomNav from "@/components/MobileBottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/context/AuthContext";
// 🚀 FIX: Imports بالکل درست کر دی گئی ہیں
import { getFilteredMenu } from "@/lib/config/menu.config";
import { ROLE_PERMISSIONS } from "@/lib/auth/roles";
import { motion, AnimatePresence } from "framer-motion";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    academic: true, finance: true, operations: true, staff: true, teacher: true, ai: true, admin: true,
  });
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});

  const { user } = useAuth();
  const role = user?.role || "teacher";
  
  // Get permissions for the current role
  const userPermissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];

  // Fetch feature flags to hide/show AI & Advanced features
  useEffect(() => {
    // 🚀 FIX: SaaS 2026 v1 API استعمال کی گئی ہے
    fetch("/api/v1/admin/feature-flags", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.success) setFeatureFlags(data.data || {});
      })
      .catch(console.error);
  }, []);

  // 🚀 FIX: getFilteredMenu اب صرف 2 arguments لیتا ہے جیسا ہم نے پچھلے ایرر میں ٹھیک کیا تھا
  const visibleGroups = getFilteredMenu(userPermissions as string[], featureFlags);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = async () => {
    await signOut(auth);
    // 🚀 FIX: SaaS 2026 v1 API
    await fetch("/api/v1/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 p-2.5 bg-white rounded-xl shadow-lg border border-gray-100"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } bg-white border-r border-gray-100 shadow-sm`}
      >
        {/* Logo */}
        <div
          className="h-20 px-6 border-b border-gray-100 flex items-center gap-3 cursor-pointer shrink-0"
          onClick={() => router.push("/dashboard")}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">EduPilot</span>
        </div>

        {/* Language Switcher */}
        <div className="px-4 py-3 border-b border-gray-50 shrink-0">
          <LanguageSwitcher />
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          {visibleGroups.map((group: any) => (
            <div key={group.title} className="mb-2">
              {group.key ? (
                <div
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => toggleGroup(group.key!)}
                >
                  <div className="flex items-center gap-3">
                    <group.icon size={18} className="text-blue-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">{group.title}</span>
                  </div>
                  {openGroups[group.key] ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                </div>
              ) : (
                <div className="px-3 py-2.5">
                   <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{group.title}</span>
                </div>
              )}
              
              <AnimatePresence initial={false}>
                {(!group.key || openGroups[group.key!]) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-2 mt-1 space-y-1 overflow-hidden border-l-2 border-gray-100 pl-2"
                  >
                    {group.items.map((item: any) => {
                      const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
                      return (
                        <Link
                          key={item.id}
                          href={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            isActive
                              ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border border-blue-100"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <item.icon size={18} className={isActive ? "text-blue-600" : "text-gray-400"} />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-bold text-sm"
          >
            <LogOut size={18} />
            <span>Secure Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto pb-24 md:pb-8">{children}</div>
        <MobileBottomNav />
      </div>
    </div>
  );
}
