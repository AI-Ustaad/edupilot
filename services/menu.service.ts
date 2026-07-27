// services/menu.service.ts
import { getFilteredMenu } from "@/lib/config/menu.config"; 
import type { Permission } from "@/lib/auth/permissions";
import { ROLE_PERMISSIONS } from "@/lib/auth/roles";
import { MenuRepository } from "@/repositories/menu.repository";
import type { IMenuService } from "@/interfaces/IMenuService";

export class MenuService implements IMenuService {
  private menuRepo: MenuRepository;

  constructor(menuRepo = new MenuRepository()) {
    this.menuRepo = menuRepo;
  }

  async getMenuForUser(
    role: string,
    permissions?: Permission[],
    disabledFeatures?: string[]
  ): Promise<any[]> {
    const currentRole = role || "superAdmin"; 
    const effectivePermissions = permissions || ROLE_PERMISSIONS[currentRole as keyof typeof ROLE_PERMISSIONS] || [];
    
    const featureFlags: Record<string, boolean> = {};
    if (disabledFeatures && disabledFeatures.length > 0) {
      disabledFeatures.forEach(f => featureFlags[f] = false);
    }

    return getFilteredMenu(currentRole, effectivePermissions as string[], featureFlags);
  }

  async getMenu(tenantId: string): Promise<any[]> {
    return this.menuRepo.getMenu(tenantId);
  }

  async saveMenu(tenantId: string, menuItems: any[]): Promise<void> {
    return this.menuRepo.saveMenu(tenantId, menuItems);
  }
}

export const menuService = new MenuService();
