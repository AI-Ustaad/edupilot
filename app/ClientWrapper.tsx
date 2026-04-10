"use client";
import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import SidebarLayout from "./components/SidebarLayout";

const allowedRoutes: Record<string, string[]> = {
  admin: ["/dashboard", "/students", "/student-profile", "/staff", "/attendance", "/fees", "/marks", "/result", "/settings"],
  staff: ["/dashboard", "/students", "/student-profile", "/fees", "/attendance"],
  teacher: ["/dashboard", "/marks", "/attendance", "/profile", "/students", "/student-profile"],
  student: ["/dashboard", "/result", "/profile", "/student-profile"],
};

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, loading } = useAuth();

  const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/signup";

  useEffect(() => {
    if (!loading) {
      // 1. اگر یوزر لاگ ان نہیں ہے
      if (!user && !isPublicPage) {
        router.push("/login");
      } 
      // 2. اگر یوزر لاگ ان ہے
      else if (user && role) {
        
        // --- A. اگر یوزر ڈیٹا بیس میں نہیں ہے (نئی رجسٹریشن یا ڈیلیٹ شدہ) ---
        if (role === "unregistered") {
          if (pathname !== "/signup") {
            router.push("/signup"); // زبردستی سائن اپ پر پھینکو
          }
        } 
        
        // --- B. اگر یوزر رجسٹرڈ ہے (پراپر رول موجود ہے) ---
        else {
          // رجسٹرڈ بندہ دوبارہ لاگ ان پیج پر نہیں جا سکتا
          if (pathname === "/login") {
            router.push("/dashboard");
          } 
          // پرمیشنز چیک کریں
          else if (!isPublicPage) {
            const userAllowedRoutes = allowedRoutes[role] || [];
            const hasAccess = userAllowedRoutes.some(route => pathname.startsWith(route));

            if (!hasAccess) {
              router.push("/dashboard"); // اگر اجازت نہیں تو واپس ڈیش بورڈ پر
            }
          }
        }
      }
    }
  }, [user, role, loading, pathname, router, isPublicPage]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f1f4f6]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3ac47d]"></div>
      </div>
    );
  }

  // اگر پبلک پیج ہے یا بندہ ابھی رجسٹر نہیں ہوا تو سائیڈ بار (Main Menu) مت دکھاؤ
  if (isPublicPage || role === "unregistered") {
    return <>{children}</>;
  }

  return <SidebarLayout>{children}</SidebarLayout>;
}
