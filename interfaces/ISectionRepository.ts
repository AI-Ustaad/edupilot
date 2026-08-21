// interfaces/ISectionRepository.ts
export interface ISectionRepository {
  bulkCreate(...args: any[]): Promise<any>;
  count(...args: any[]): Promise<any>;
  create(...args: any[]): Promise<any>;
  createMissingStructure(...args: any[]): Promise<any>;
  createMissingSections(...args: any[]): Promise<any>;
  delete(...args: any[]): Promise<any>;
  deleteAllForTenant(...args: any[]): Promise<any>;
  exists(...args: any[]): Promise<any>;
  findAll(...args: any[]): Promise<any>;
  findAllActive(...args: any[]): Promise<any>;
  findAllIncludingDeleted(...args: any[]): Promise<any>;
  findById(...args: any[]): Promise<any>;
  paginate(...args: any[]): Promise<any>;
  softDelete(...args: any[]): Promise<any>;
  softDeleteBySectionId(...args: any[]): Promise<any>;
  update(...args: any[]): Promise<any>;
}
