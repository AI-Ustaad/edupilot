"use client";

import React from "react";
import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/lib/auth/permissions";

interface RequirePermissionProps {
  permissions: Permission | Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode; // اگر پرمیشن نہ ہو تو کیا دکھانا ہے؟ (مثلاً Lock icon یا خالی جگہ)
  requireAll?: boolean;       // اگر true ہو تو دی گئی تمام پرمیشنز ہونا لازمی ہیں
}

export default function RequirePermission({ 
  permissions, 
  children, 
  fallback = null, 
  requireAll = false 
}: RequirePermissionProps) {
  
  const { hasPermission, hasAllPermissions } = usePermission();

  const isAllowed = requireAll 
    ? hasAllPermissions(Array.isArray(permissions) ? permissions : [permissions])
    : hasPermission(permissions);

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
