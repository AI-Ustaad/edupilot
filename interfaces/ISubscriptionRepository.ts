// interfaces/ISubscriptionRepository.ts
export interface ISubscriptionRepository {
  activate(...args: any[]): Promise<any>;
  bulkCreate(...args: any[]): Promise<any>;
  cancel(...args: any[]): Promise<any>;
  count(...args: any[]): Promise<any>;
  create(...args: any[]): Promise<any>;
  delete(...args: any[]): Promise<any>;
  exists(...args: any[]): Promise<any>;
  findAll(...args: any[]): Promise<any>;
  findById(...args: any[]): Promise<any>;
  findByTenant(...args: any[]): Promise<any>;
  listAll(...args: any[]): Promise<any>;
  paginate(...args: any[]): Promise<any>;
  softDelete(...args: any[]): Promise<any>;
  update(...args: any[]): Promise<any>;
}
