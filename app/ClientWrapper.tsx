"use client";
import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SidebarLayout from "@/app/components/SidebarLayout";

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
        router.push("/login");
      } else if (user && role && !isPublicPage) {
        const userAllowedRoutes = allowedRoutes[role] || [];
        const hasAccess = userAllowedRoutes.some(route => pathname.startsWith(route));

        if (!hasAccess) {
          alert("Access Denied: You do not have permission to view this page.");
          router.push("/dashboard");
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
