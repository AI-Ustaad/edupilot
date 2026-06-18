// services/menu.service.ts

// 🚀 فکس: DEFAULT_MENU کی جگہ MENU_CONFIG کر دیا گیا ہے
import { MENU_CONFIG } from "@/lib/config/menu.config"; 
import type { Permission } from "@/lib/auth/permissions";
import { ROLE_PERMISSIONS } from "@/lib/auth/roles";

export class MenuService {
  async getMenuForUser(
    role: string,
    permissions?: Permission[],
    disabledFeatures?: string[]
  ): Promise<any[]> {
    const currentRole = role || "superAdmin"; 
    const effectivePermissions = permissions || ROLE_PERMISSIONS[currentRole as keyof typeof ROLE_PERMISSIONS] || [];
    const disabled = disabledFeatures || []; 

    const isAuthorized = (item: any) => {
      if (currentRole === "superAdmin") {
        if (item.featureFlag && disabled.indexOf(item.featureFlag) !== -1) return false;
        return true;
      }
      
      if (item.allowedRoles && item.allowedRoles.indexOf(currentRole) !== -1) return true;
      if (item.permission && effectivePermissions.indexOf(item.permission) !== -1) return true;
      // آپ کے نئے کوڈ میں requiredPermission استعمال ہوا ہے، اسے بھی سپورٹ کر دیا گیا ہے
      if (item.requiredPermission && effectivePermissions.indexOf(item.requiredPermission) !== -1) return true;

      if (item.allowedRoles || item.permission || item.requiredPermission) return false;
      return true; 
    };

    // 🚀 فکس: MENU_CONFIG استعمال کیا گیا ہے اور items/children دونوں کو ہینڈل کیا گیا ہے
    return (MENU_CONFIG || [])
      .filter((group: any) => {
        if (!group.children && !group.items && !isAuthorized(group)) return false;
        return true;
      })
      .map((group: any) => {
        const childrenList = group.children || group.items;
        if (!childrenList) return group;
        return {
          ...group,
          children: childrenList.filter((child: any) => isAuthorized(child)),
          items: childrenList.filter((child: any) => isAuthorized(child)), 
        };
      })
      .filter((group: any) => {
        const childrenList = group.children || group.items;
        return !childrenList || childrenList.length > 0;
      });
  }
}

export const menuService = new MenuService();
