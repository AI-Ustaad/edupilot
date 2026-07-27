// interfaces/ISyllabusRepository.ts
export interface ISyllabusRepository {
  bulkCreate(...args: any[]): Promise<any>;
  count(...args: any[]): Promise<any>;
  create(...args: any[]): Promise<any>;
  delete(...args: any[]): Promise<any>;
  exists(...args: any[]): Promise<any>;
  findAll(...args: any[]): Promise<any>;
  findById(...args: any[]): Promise<any>;
  findWithFilters(...args: any[]): Promise<any>;
  paginate(...args: any[]): Promise<any>;
  softDelete(...args: any[]): Promise<any>;
  update(...args: any[]): Promise<any>;
  updateSyllabus(...args: any[]): Promise<any>;
}
