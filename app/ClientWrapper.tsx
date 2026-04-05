// app/ClientWrapper.tsx
"use client";
import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SidebarLayout from "@/app/components/SidebarLayout";

// Role-based Access Rules (رولز کی سیٹنگ)
const allowedRoutes: Record<string, string[]> = {
  admin: ["/dashboard", "/students", "/staff", "/attendance", "/fees", "/marks", "/result", "/settings"],
  teacher: ["/dashboard", "/marks", "/attendance", "/profile"],
  student: ["/dashboard", "/result", "/profile"],
};

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, loading } = useAuth();

  const isPublicPage = pathname === "/" || pathname === "/login";

  useEffect(() => {
    if (!loading) {
      if (!user && !isPublicPage) {
        router.push("/login"); // لاگ ان نہیں ہے تو باہر نکالو
      } else if (user && role && !isPublicPage) {
        // چیک کریں کیا اس یوزر کے پاس اس پیج کی پرمیشن ہے؟
        const userAllowedRoutes = allowedRoutes[role] || [];
        const hasAccess = userAllowedRoutes.some(route => pathname.startsWith(route));

        if (!hasAccess) {
          alert("Access Denied: You do not have permission to view this page.");
          router.push("/dashboard"); // واپس ڈیش بورڈ پر بھیج دو
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

  if (isPublicPage) return <>{children}</>;

  return <SidebarLayout>{children}</SidebarLayout>;
}
