export interface IAuditRepository {
  create(entry: any, tenantId: string): Promise<string>;
  findByTenant(tenantId: string, options?: { limit?: number; action?: string; entityType?: string }): Promise<any[]>;
  findByEntity(tenantId: string, entityType: string, entityId: string): Promise<any[]>;
  findRecent(tenantId: string, limit?: number): Promise<any[]>;
}
