export interface ISubscriptionRepository {
  findByTenant(tenantId: string): Promise<any | null>;
  findAll(tenantId: string): Promise<any[]>;
  listAll(): Promise<any[]>;
  create(data: any, tenantId: string): Promise<string>;
  update(id: string, data: Partial<any>, tenantId: string): Promise<void>;
  activate(tenantId: string, planId: string, userId?: string): Promise<void>;
  cancel(tenantId: string, userId?: string): Promise<void>;
}
