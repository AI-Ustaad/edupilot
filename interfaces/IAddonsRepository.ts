export interface IAddonsRepository {
  findByTenant(tenantId: string): Promise<any | null>;
  save(tenantId: string, addons: any): Promise<void>;
  getAddons(tenantId: string): Promise<any | null>;
  saveAddons(tenantId: string, addons: any): Promise<void>;
}
