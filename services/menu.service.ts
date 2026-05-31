// services/menu.service.ts
import { DEFAULT_MENU } from "@/lib/config/menu.config";   // ← درست پاتھ
import { MenuGroup } from "@/types/menu";
import { Permission, ROLE_PERMISSIONS } from "@/lib/auth/permissions";

export class MenuService {
  async getMenuForUser(role: string, permissions?: Permission[]): Promise<MenuGroup[]> {
    const effectivePermissions = permissions || ROLE_PERMISSIONS[role] || [];

    const isAuthorized = (item: { allowedRoles?: string[]; permission?: Permission }) => {
      if (item.allowedRoles && !item.allowedRoles.includes(role)) return false;
      if (item.permission && !effectivePermissions.includes(item.permission)) return false;
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
