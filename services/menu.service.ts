// services/menu.service.ts
import { getFilteredMenu } from "@/lib/config/menu.config";
import { ROLE_PERMISSIONS } from "@/lib/auth/roles";
import type { Permission } from "@/lib/auth/permissions";

export class MenuService {
  async getMenuForUser(
    role: string,
    permissions?: Permission[],
    disabledFeatures?: string[]
  ) {
    const effectivePermissions =
      permissions ||
      (ROLE_PERMISSIONS as Record<string, string[]>)[role] ||
      [];

    // Convert disabledFeatures array to featureFlags record (false = hidden)
    const featureFlags: Record<string, boolean> = {};
    if (disabledFeatures) {
      disabledFeatures.forEach((f) => {
        featureFlags[f] = false;
      });
    }

    // Delegate to the single source of truth
    return getFilteredMenu(currentRole, effectivePermissions, featureFlags);
  }
}

export const menuService = new MenuService();
