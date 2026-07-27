// interfaces/IUserRepository.ts
export interface IUserRepository {
  create(...args: any[]): Promise<any>;
  findAllByTenant(...args: any[]): Promise<any>;
  findByUidWithFallback(...args: any[]): Promise<any>;
  updateRole(...args: any[]): Promise<any>;
}
