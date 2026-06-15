"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { hasAnyPermission } from "@/lib/auth/rbac";
import AccessDenied from "./AccessDenied";
import { ReactNode } from "react";

// 🗺️ URL اور اس کی مطلوبہ پرمیشنز کی میپنگ
function getRequiredPermissions(pathname: string): any[] {
  if (!pathname) return []; // Fallback for safety

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

  // جب تک یوزر کا رول لوڈ نہ ہو جائے، ایک بلینک سکرین یا لوڈر دکھائیں تاکہ فلیش (Flash) نہ آئے
  if (!role || role === "loading") return null; 

  const requiredPermissions = getRequiredPermissions(pathname);

  // اگر پیج کے لیے پرمیشن چاہیے، اور یوزر کے پاس وہ پرمیشن نہیں ہے، تو بلاک کر دیں!
  if (requiredPermissions.length > 0 && !hasAnyPermission(role, requiredPermissions)) {
    return <AccessDenied />;
  }

  // اگر سب ٹھیک ہے، تو اصل پیج دکھا دیں
  return <>{children}</>;
}
