// interfaces/IAuditRepository.ts
export interface IAuditRepository {
  bulkCreate(...args: any[]): Promise<any>;
  count(...args: any[]): Promise<any>;
  create(...args: any[]): Promise<any>;
  delete(...args: any[]): Promise<any>;
  exists(...args: any[]): Promise<any>;
  findAll(...args: any[]): Promise<any>;
  findByEntity(...args: any[]): Promise<any>;
  findById(...args: any[]): Promise<any>;
  findByTenant(...args: any[]): Promise<any>;
  findRecent(...args: any[]): Promise<any>;
  paginate(...args: any[]): Promise<any>;
  softDelete(...args: any[]): Promise<any>;
  update(...args: any[]): Promise<any>;
}
