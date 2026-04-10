"use client";
import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import SidebarLayout from "./components/SidebarLayout";

const allowedRoutes: Record<string, string[]> = {
  // ہم نے ان سب میں "/student-profile" کا راستہ کھول دیا ہے
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
      if (!user && !isPublicPage) {
        router.push("/login");
      } else if (user && role && !isPublicPage) {
        const userAllowedRoutes = allowedRoutes[role] || [];
        // Check if current path matches any allowed route
        const hasAccess = userAllowedRoutes.some(route => pathname.startsWith(route));

        if (!hasAccess) {
          router.push("/dashboard"); // اگر راستہ لسٹ میں نہیں ہے تو ڈیش بورڈ پر پھینک دو
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

  if (isPublicPage) {
    return <>{children}</>;
  }

  return <SidebarLayout>{children}</SidebarLayout>;
}
