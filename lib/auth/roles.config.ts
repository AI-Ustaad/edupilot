import { Role } from "@/types/auth";

export interface RoleConfig {
  redirect: string;
}

export const ROLE_CONFIG: Record<Role, RoleConfig> = {
  superAdmin: { redirect: "/dashboard" },
  schoolAdmin: { redirect: "/dashboard" },
  admin: { redirect: "/dashboard" },
  teacher: { redirect: "/dashboard" },
  parent: { redirect: "/parent/dashboard" },
  student: { redirect: "/dashboard" },
  guest: { redirect: "/dashboard" },
};

export const SESSION_EXPIRES_IN_DAYS = 5;
export const SESSION_EXPIRES_IN_MS = 60 * 60 * 24 * SESSION_EXPIRES_IN_DAYS * 1000;
