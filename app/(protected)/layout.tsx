"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Menu, X, LogOut, ShieldCheck, ChevronDown, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MobileBottomNav from "@/components/MobileBottomNav";

// 🚀 Enterprise Imports
import GlobalSearch from "@/components/GlobalSearch";
import { logger } from "@/lib/logger/logger";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import { getFilteredMenu } from "@/lib/config/menu.config"; 
import { ROLE_PERMISSIONS } from "@/lib/auth/roles"; 
import apiClient from "@/lib/api/client";
import { safeObject } from "@/lib/api/safeResponse";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const role = user?.role || "teacher";

  // 🚀 Real-time Listeners (Live Notifications & Dashboard)
  useRealtimeNotifications();
  useRealtimeDashboard();

  // Initialize open groups
  useEffect(() => {
    const initialOpenGroups: Record<string, boolean> = {};
    ["Command Center", "Students", "Academics"].forEach(key => {
      initialOpenGroups[key] = true;
    });
    setOpenGroups(initialOpenGroups);
    setIsLoaded(true);
  }, []);

  // Fetch feature flags using Axios (Enterprise Pattern)
  useEffect(() => {
    if (!user?.tenantId) return;
    
    apiClient.get("/admin/feature-flags")
      .then(res => {
        const data = safeObject(res);
        if (data && Object.keys(data).length > 0) setFeatureFlags(data);
      })
      .catch(console.error);
  }, [user?.tenantId]);

  // Get user permissions
  const userPermissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
  const visibleGroups = isLoaded ? getFilteredMenu(userPermissions as string[], featureFlags) : [];

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await apiClient.post("/auth/logout"); // 🚀 Axios instead of fetch
      window.location.href = "/";
    } catch (error) {
      logger.error("Logout error:", { metadata: { error } });
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
          <p className="text-gray-600 font-medium">Loading EduPilot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 p-2.5 bg-white rounded-xl shadow-lg border border-gray-100 hover:bg-gray-50 transition"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X size={24} className="text-gray-700" />
        ) : (
          <Menu size={24} className="text-gray-700" />
        )}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isMobileMenuOpen ? 0 : typeof window !== 'undefined' && window.innerWidth < 768 ? -288 : 0 }}
        className={`fixed inset-y-0 left-0 z-40 w-72 flex flex-col bg-white border-r border-gray-100 shadow-sm md:relative md:translate-x-0 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo Section & Notifications */}
        <div className="h-20 px-6 border-b border-gray-100 flex items-center justify-between gap-3 shrink-0">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition rounded-lg p-1 -ml-1"
            onClick={() => router.push("/dashboard")}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                EduPilot
              </span>
              <p className="text-[10px] text-gray-400 font-medium -mt-1">School Management</p>
            </div>
          </div>
          
          {/* 🚀 Live Notifications Bell Icon */}
          <NotificationsDropdown />
        </div>

        {/* Language Switcher */}
        <div className="px-4 py-3 border-b border-gray-50 shrink-0">
          <LanguageSwitcher />
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          {visibleGroups.map((group: any) => (
            <div key={group.title || group.key} className="mb-2">
              <button
                onClick={() => toggleGroup(group.title || group.key)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <group.icon size={18} className="text-blue-500 group-hover:text-blue-600 transition" />
                  <span className="text-xs font-bold uppercase tracking-wider">{group.title}</span>
                </div>
                {openGroups[group.title || group.key] ? (
                  <ChevronDown size={16} className="text-gray-400 transition" />
                ) : (
                  <ChevronRight size={16} className="text-gray-400 transition" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {openGroups[group.title || group.key] && (
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
                        <button
                          key={item.id}
                          onClick={() => {
                            router.push(item.path);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            isActive
                              ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border border-blue-100"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <item.icon size={18} className={isActive ? "text-blue-600" : "text-gray-400"} />
                          <span className="flex-1 text-left">{item.name}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-100 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-bold text-sm group"
          >
            <LogOut size={18} className="group-hover:scale-110 transition" />
            <span>Secure Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto pb-24 md:pb-8">
          {children}
        </div>
        <MobileBottomNav />
      </main>

      {/* 🚀 Global Search (Ctrl + K) */}
      <GlobalSearch />
      
    </div>
  );
}
