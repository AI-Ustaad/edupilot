export interface ITenantRepository {
  findById(id: string, tenantId: string): Promise<any | null>;
  create(data: any, userId?: string): Promise<string>;
  update(id: string, data: Partial<any>, tenantId: string): Promise<void>;
  findAll(tenantId: string): Promise<any[]>;
  listAll(): Promise<any[]>;
  findActive(): Promise<any[]>;
  findByPlan(planId: string): Promise<any[]>;
}
