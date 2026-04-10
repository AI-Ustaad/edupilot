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
        
        // --- A. Unregistered User (جس نے ابھی سکول رجسٹر نہیں کیا) ---
        if (role === "unregistered") {
          // THE FIX: اگر وہ لینڈنگ پیج (/) یا سائن اپ (/signup) پر ہے تو اسے مت چھیڑیں!
          // صرف تب سائن اپ پر پھینکیں جب وہ کسی اور پیج (جیسے لاگ ان یا ڈیش بورڈ) پر جانے کی کوشش کرے۔
          if (pathname !== "/" && pathname !== "/signup") {
            router.push("/signup");
          }
        } 
        
        // --- B. Registered User (مکمل رجسٹرڈ یوزر) ---
        else {
          // اگر رجسٹرڈ بندہ لاگ ان یا سائن اپ پیج کھولنے کی کوشش کرے تو اسے ڈیش بورڈ پر بھیج دو
          if (pathname === "/login" || pathname === "/signup") {
            router.push("/dashboard");
          } 
          // اندرونی پیجز کی سیکیورٹی
          else if (!isPublicPage) {
            const userAllowedRoutes = allowedRoutes[role] || [];
            const hasAccess = userAllowedRoutes.some(route => pathname.startsWith(route));

            if (!hasAccess) {
              router.push("/dashboard");
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

  // لینڈنگ پیج، پبلک پیجز، یا ان رجسٹرڈ یوزرز کے لیے سائیڈ بار (Main Menu) مت دکھاؤ
  if (isPublicPage || role === "unregistered") {
    return <>{children}</>;
  }

  return <SidebarLayout>{children}</SidebarLayout>;
}
