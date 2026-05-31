// types/menu.ts
import { Permission } from "@/lib/auth/permissions"; // or '@/lib/permissions-new' depending on your setup

export interface MenuItem {
  labelKey: string;          // i18n key (e.g., "Sidebar.commandCenter")
  icon: string;              // icon name (we'll map later)
  path?: string;
  permission?: Permission;   // optional – if set, user must have this permission
  featureFlag?: string;      // optional – future use with feature flags
  allowedRoles?: string[];   // optional – restrict to specific roles
  children?: MenuItem[];
}

export interface MenuGroup {
  labelKey: string;
  icon: string;
  permission?: Permission;
  allowedRoles?: string[];
  children: MenuItem[];
}
