// interfaces/IAddonsRepository.ts
export interface IAddonsRepository {
  findByTenant(...args: any[]): Promise<any>;
  getAddons(...args: any[]): Promise<any>;
  save(...args: any[]): Promise<any>;
  saveAddons(...args: any[]): Promise<any>;
}
