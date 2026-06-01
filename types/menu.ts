import { Permission } from "@/lib/auth/permissions";

export interface MenuItem {
  name: string;
  icon: string;            // lucide icon name as string (we'll map them in the component)
  path: string;
  allowedRoles?: string[];
  permission?: Permission;
  featureFlag?: string;    // key from FeatureFlags
}

export interface MenuGroup {
  title: string;
  icon: string;
  key?: string | null;
  allowedRoles?: string[];
  permission?: Permission;
  featureFlag?: string;
  children: MenuItem[];
}
