export interface IChatRepository {
  findByTenant(tenantId: string, teacherId?: string, parentId?: string, limitCount?: number): Promise<any[]>;
  createMessage(data: any): Promise<string>;
}
