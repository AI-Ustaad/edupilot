export interface IMenuRepository {
  findByTenant(tenantId: string): Promise<any[]>;
  save(tenantId: string, menuItems: any[]): Promise<void>;
  getMenu(tenantId: string): Promise<any[]>;
  saveMenu(tenantId: string, menuItems: any[]): Promise<void>;
}
