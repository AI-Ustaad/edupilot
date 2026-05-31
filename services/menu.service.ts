import { DEFAULT_MENU } from "@/config/default-menu";
import { MenuGroup } from "@/types/menu";
import { Permission, ROLE_PERMISSIONS } from "@/lib/auth/permissions";

export class MenuService {
  /**
   * Get the menu filtered for a specific user.
   * @param role - current user role
   * @param permissions - optional array of permissions to check; uses ROLE_PERMISSIONS if not provided
   * @returns filtered menu groups
   */
  async getMenuForUser(role: string, permissions?: Permission[]): Promise<MenuGroup[]> {
    // Basic: use the default static menu
    const effectivePermissions = permissions || ROLE_PERMISSIONS[role] || [];

    const isAuthorized = (item: { allowedRoles?: string[]; permission?: Permission }) => {
      if (item.allowedRoles && !item.allowedRoles.includes(role)) return false;
      if (item.permission && !effectivePermissions.includes(item.permission)) return false;
      return true;
    };

    // Deep filter groups and their children
    return DEFAULT_MENU
      .filter(group => isAuthorized(group))
      .map(group => ({
        ...group,
        children: group.children.filter(child => isAuthorized(child))
      }))
      .filter(group => group.children.length > 0); // hide empty groups
  }
}
