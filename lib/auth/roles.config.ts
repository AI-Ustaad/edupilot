import { Role } from "@/types/auth";

export interface RoleConfig {
  redirect: string;
}

export const ROLE_CONFIG: Record<Role, RoleConfig> = {
  superAdmin: { redirect: "/super-admin/analytics" },
  schoolAdmin: { redirect: "/admin/analytics" },
  admin: { redirect: "/admin/analytics" },
  teacher: { redirect: "/teacher/dashboard" },
  parent: { redirect: "/parent/dashboard" },
  student: { redirect: "/dashboard" },
  guest: { redirect: "/login" },
};

export const SESSION_EXPIRES_IN_DAYS = 5;
export const SESSION_EXPIRES_IN_MS = 60 * 60 * 24 * SESSION_EXPIRES_IN_DAYS * 1000;
