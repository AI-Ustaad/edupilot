// interfaces/IChatRepository.ts
export interface IChatRepository {
  createMessage(...args: any[]): Promise<any>;
  findByTenant(...args: any[]): Promise<any>;
}
