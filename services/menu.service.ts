// services/menu.service.ts

import { DEFAULT_MENU } from "@/lib/config/menu.config";
import type { Permission } from "@/lib/auth/permissions";
import { ROLE_PERMISSIONS } from "@/lib/auth/roles";

export class MenuService {
  async getMenuForUser(
    role: string,
    permissions?: Permission[],
    disabledFeatures?: string[]
  ): Promise<any[]> {
    // 1. Role fallback handling
    const currentRole = role || "superAdmin"; 
    
    // 2. Extract effective permissions
    const effectivePermissions = permissions || ROLE_PERMISSIONS[currentRole as keyof typeof ROLE_PERMISSIONS] || [];
    const disabled = new Set(disabledFeatures || []);

    // 3. Authorization Logic
    const isAuthorized = (item: any) => {
      // SuperAdmin sees everything except disabled features
      if (currentRole === "superAdmin") {
        if (item.featureFlag && disabled.has(item.featureFlag)) return false;
        return true;
      }

      // Check Allowed Roles array
      if (item.allowedRoles && item.allowedRoles.includes(currentRole)) return true;
      
      // Check specific Permission
      if (item.permission && effectivePermissions.includes(item.permission)) return true;

      // If neither allowedRole nor permission matches, hide it
      if (item.allowedRoles || item.permission) return false;

      // Default fallback
      return true; 
    };

    // 4. Filter and map the menu
    return DEFAULT_MENU
      .filter((group) => {
        if (!group.children && !isAuthorized(group)) return false;
        return true;
      })
      .map((group) => {
        if (!group.children) return group;
        return {
          ...group,
          children: group.children.filter((child: any) => isAuthorized(child)),
        };
      })
      .filter((group) => !group.children || group.children.length > 0);
  }
}

export const menuService = new MenuService();
