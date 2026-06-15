"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { hasAnyPermission } from "@/lib/auth/client-rbac";
import AccessDenied from "./AccessDenied";
import { ReactNode } from "react";

// 🛡️ پیجز اور ان کی مطلوبہ پرمیشنز/رولز کا نقشہ (Route Permissions Map)
const routeRules: Record<string, { permissions?: string[]; allowedRoles?: string[] }> = {
  "/students": { permissions: [PERMISSIONS.students.view] },
  "/classes": { permissions: [PERMISSIONS.settings.view] },
  
  // ⚠️ آپ اپنے باقی تمام محفوظ پیجز کے رولز یہاں شامل کر سکتے ہیں، مثال کے طور پر:
  // "/staff": { allowedRoles: ["superAdmin", "admin"] },
  // "/finance": { allowedRoles: ["superAdmin", "accountant"] },
};

export default function RouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const role = user?.role || "";

  // اگر رول ابھی لوڈ ہو رہا ہے تو کچھ رینڈر نہ کریں (Loading State)
  if (!role || role === "loading") {
    return null; 
  }

  // 1. سپر ایڈمن (superAdmin) کو ہر پیج بائی ڈیفالٹ دیکھنے کی اجازت ہے
  if (role === "superAdmin") {
    return <>{children}</>;
  }

  // 2. موجودہ URL پاتھ کے مطابق رول یا پرمیشن چیک کریں
  // (startsWith کا استعمال کیا ہے تاکہ سب-پیجز جیسے /students/add بھی پروٹیکٹ ہو جائیں)
  const matchedRoute = Object.keys(routeRules).find((route) => pathname.startsWith(route));

  if (matchedRoute) {
    const { permissions, allowedRoles } = routeRules[matchedRoute];

    // الف: اگر مخصوص رولز کی لسٹ موجود ہے اور یوزر کا رول اس میں شامل نہیں ہے
    if (allowedRoles && !allowedRoles.includes(role)) {
      return <AccessDenied />;
    }

    // ب: اگر مخصوص پرمیشنز لازمی ہیں اور یوزر کے پاس وہ پرمیشن نہیں ہے
    if (permissions && permissions.length > 0) {
      const isAllowed = hasAnyPermission(role, permissions);
      if (!isAllowed) {
        return <AccessDenied />;
      }
    }
  }

  // اگر یوزر تمام سیکیورٹی چیکس پاس کر لیتا ہے تو پیج دکھا دیں
  return <>{children}</>;
}
