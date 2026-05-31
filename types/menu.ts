// types/menu.ts
import { Permission } from "@/lib/auth/permissions"; // <-- must be present

export interface MenuItem {
  labelKey: string;
  icon: string;
  path?: string;
  permission?: Permission;
  allowedRoles?: string[];
  featureFlag?: string;
  children?: MenuItem[];
}

export interface MenuGroup {
  labelKey: string;
  icon: string;
  permission?: Permission;
  allowedRoles?: string[];
  featureFlag?: string;
  children: MenuItem[];
}
