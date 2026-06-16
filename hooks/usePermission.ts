"use client";

import { useAuth } from "@/context/AuthContext";
import { ROLE_PERMISSIONS, Role } from "@/lib/auth/roles";
import { Permission } from "@/lib/auth/permissions";

export const usePermission = () => {
  const { user, loading } = useAuth();

  const hasPermission = (requiredPermissions: Permission | Permission[]): boolean => {
    // 1. اگر یوزر لاگ ان نہیں ہے یا لوڈ ہو رہا ہے تو فوراً False کر دیں
    if (!user || !user.role || loading) return false;

    const userRole = user.role as Role;
    const userAllowedPermissions = ROLE_PERMISSIONS[userRole] || [];

    // 2. اگر ایک پرمیشن سٹرنگ ہے تو اسے ایرے (Array) میں بدل دیں
    const reqPerms = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

    // 3. چیک کریں کہ کیا یوزر کے پاس مطلوبہ پرمیشنز میں سے کوئی ایک بھی موجود ہے؟
    return reqPerms.some((perm) => userAllowedPermissions.includes(perm));
  };

  const hasAllPermissions = (requiredPermissions: Permission[]): boolean => {
    if (!user || !user.role || loading) return false;
    const userRole = user.role as Role;
    const userAllowedPermissions = ROLE_PERMISSIONS[userRole] || [];

    // 4. سٹرکٹ چیک (Strict Check): کیا تمام کی تمام پرمیشنز موجود ہیں؟
    return requiredPermissions.every((perm) => userAllowedPermissions.includes(perm));
  };

  return { 
    hasPermission, 
    hasAllPermissions, 
    role: user?.role as Role | undefined,
    isSuperAdmin: user?.role === "superAdmin"
  };
};
