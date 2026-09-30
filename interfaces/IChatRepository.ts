// interfaces/IChatRepository.ts
export interface IChatRepository {
  createMessage(data: any): Promise<string>;
  findByTenant(tenantId: string, filterOrTeacherId?: any, parentId?: string, limitCount?: number): Promise<any[]>;
}
