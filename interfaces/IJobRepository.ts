// interfaces/IJobRepository.ts
export interface IJobRepository {
  create(...args: any[]): Promise<any>;
  failJob(...args: any[]): Promise<any>;
  findById(...args: any[]): Promise<any>;
  updateProgress(...args: any[]): Promise<any>;
}
