import { DEFAULT_MENU } from "@/lib/config/menu.config";
import { MenuGroup } from "@/types/menu";
import type { Permission } from "@/lib/auth/permissions";
import { ROLE_PERMISSIONS } from "@/lib/auth/roles";

export class MenuService {
  async getMenuForUser(
    role: string,
    permissions?: Permission[],
    disabledFeatures?: string[]
  ): Promise<MenuGroup[]> {
    const effectivePermissions = permissions || ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
    const disabled = new Set(disabledFeatures || []);

    const isAuthorized = (item: {
      allowedRoles?: string[];
      permission?: Permission;
      featureFlag?: string;
    }) => {
      if (item.allowedRoles && !item.allowedRoles.includes(role)) return false;
      if (item.permission && !effectivePermissions.includes(item.permission)) return false;
      if (item.featureFlag && disabled.has(item.featureFlag)) return false;
      return true;
    };

    return DEFAULT_MENU
      .filter((group) => isAuthorized(group))
      .map((group) => ({
        ...group,
        children: group.children.filter((child) => isAuthorized(child)),
      }))
      .filter((group) => group.children.length > 0);
  }
}

export const menuService = new MenuService();