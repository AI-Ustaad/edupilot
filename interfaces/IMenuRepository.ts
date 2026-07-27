// interfaces/IMenuRepository.ts
export interface IMenuRepository {
  findByTenant(...args: any[]): Promise<any>;
  getMenu(...args: any[]): Promise<any>;
  save(...args: any[]): Promise<any>;
  saveMenu(...args: any[]): Promise<any>;
}
