import { DEFAULT_MENU } from "@/lib/config/menu.config";
import { MenuGroup } from "@/types/menu";
import { Permission, ROLE_PERMISSIONS } from "@/lib/auth/permissions";

export class MenuService {
  async getMenuForUser(
    role: string,
    permissions?: Permission[],
    disabledFeatures?: string[]  // <-- new parameter
  ): Promise<MenuGroup[]> {
    const effectivePermissions = permissions || ROLE_PERMISSIONS[role] || [];
    const disabled = new Set(disabledFeatures || []);

    const isAuthorized = (item: {
      allowedRoles?: string[];
      permission?: Permission;
      featureFlag?: string;   // make sure MenuItem/Group has this field
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
