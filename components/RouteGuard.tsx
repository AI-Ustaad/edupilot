"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { hasAnyPermission } from "@/lib/auth/client-rbac";
import AccessDenied from "./AccessDenied";
import { ReactNode } from "react";

export default function RouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  
  // یہاں رول چیک کریں
  const role = user?.role;
  if (!role || role === "loading") return null; 

  // اگر ضرورت ہو تو یہاں مزید پرمیشن چیک لگا لیں
  return <>{children}</>;
}
