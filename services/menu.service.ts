// services/menu.service.ts
import { MENU_CONFIG, getFilteredMenu } from "@/lib/config/menu.config"; 
import type { Permission } from "@/lib/auth/permissions";
import { ROLE_PERMISSIONS } from "@/lib/auth/roles";

export class MenuService {
  async getMenuForUser(
    role: string,
    permissions?: Permission[],
    disabledFeatures?: string[]
  ): Promise<any[]> {
    // 🟢 FIX: Define currentRole variable
    const currentRole = role || "superAdmin"; 
    const effectivePermissions = permissions || ROLE_PERMISSIONS[currentRole as keyof typeof ROLE_PERMISSIONS] || [];
    
    // Convert disabledFeatures array to enabledFeatureFlags object for getFilteredMenu
    const featureFlags: Record<string, boolean> = {};
    if (disabledFeatures && disabledFeatures.length > 0) {
      // Assuming disabledFeatures means those flags are false
      disabledFeatures.forEach(f => featureFlags[f] = false);
    }

    // Delegate to the single source of truth
    return getFilteredMenu(currentRole, effectivePermissions as string[], featureFlags);
  }
}

export const menuService = new MenuService();
