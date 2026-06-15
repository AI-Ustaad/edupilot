"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { hasAnyPermission } from "@/lib/auth/client-rbac";
import AccessDenied from "./AccessDenied";
import { ReactNode } from "react";

function getRequiredPermissions(pathname: string): any[] {
  if (!pathname) return [];

  // Admin & Settings
  if (pathname.startsWith("/admin/users")) return [PERMISSIONS.settings.manage];
  if (pathname.startsWith("/admin/syllabus")) return [PERMISSIONS.settings.view, PERMISSIONS.lessonPlans.view];
  if (pathname.startsWith("/admin/buses")) return [PERMISSIONS.buses.view];
  if (pathname.startsWith("/settings")) return [PERMISSIONS.settings.view];
  
  // Academic & Operations
  if (pathname.startsWith("/students")) return [PERMISSIONS.students.view];
  if (pathname.startsWith("/fees")) return [PERMISSIONS.fees.view];
  if (pathname.startsWith("/attendance")) return [PERMISSIONS.attendance.view];
  if (pathname.startsWith("/timetable")) return [PERMISSIONS.settings.view, PERMISSIONS.attendance.view];
  if (pathname.startsWith("/staff")) return [PERMISSIONS.staff.view];

  // Teacher Specific
  if (pathname.startsWith("/teacher/assignments")) return [PERMISSIONS.assignments.view];
  if (pathname.startsWith("/teacher/quizzes")) return [PERMISSIONS.quizzes.view];
  
  return [];
}

export default function RouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const role = user?.role;

  if (!role || role === "loading") return null; 

  const requiredPermissions = getRequiredPermissions(pathname);

  if (requiredPermissions.length > 0 && !hasAnyPermission(role, requiredPermissions)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
