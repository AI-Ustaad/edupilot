// interfaces/IMarksRepository.ts
export interface IMarksRepository {
  bulkCreate(...args: any[]): Promise<any>;
  count(...args: any[]): Promise<any>;
  create(...args: any[]): Promise<any>;
  delete(...args: any[]): Promise<any>;
  exists(...args: any[]): Promise<any>;
  findAll(...args: any[]): Promise<any>;
  findById(...args: any[]): Promise<any>;
  findByStudent(...args: any[]): Promise<any>;
  findSkills(...args: any[]): Promise<any>;
  findWithFilters(...args: any[]): Promise<any>;
  paginate(...args: any[]): Promise<any>;
  softDelete(...args: any[]): Promise<any>;
  softDeleteMark(...args: any[]): Promise<any>;
  update(...args: any[]): Promise<any>;
  upsert(...args: any[]): Promise<any>;
}
