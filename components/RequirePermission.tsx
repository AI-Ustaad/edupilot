"use client";

import { useAuth } from "@/context/AuthContext";
import { hasAnyPermission } from "@/lib/auth/client-rbac";
import { ReactNode } from "react";

interface RequirePermissionProps {
  permissions?: any[];
  allowedRoles?: string[];
  children: ReactNode;
}

export default function RequirePermission({ permissions, allowedRoles, children }: RequirePermissionProps) {
  const { user } = useAuth();
  const role = user?.role || "";

  if (!role || role === "loading") return null;

  // سپر ایڈمن کو ہر بٹن نظر آئے گا
  if (role === "superAdmin") return <>{children}</>;

  // اگر مخصوص رولز دیے گئے ہیں
  if (allowedRoles && allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  // اگر مخصوص پرمیشنز دی گئی ہیں
  if (permissions && permissions.length > 0) {
    if (hasAnyPermission(role, permissions)) {
      return <>{children}</>;
    }
  }

  // اگر اجازت نہیں ہے تو بٹن کو سکرین سے غائب کر دیں
  return null;
}
