// interfaces/IAcademicYearRepository.ts
export interface IAcademicYearRepository {
  bulkCreate(...args: any[]): Promise<any>;
  count(...args: any[]): Promise<any>;
  create(...args: any[]): Promise<any>;
  createIfAbsentByName(...args: any[]): Promise<any>;
  delete(...args: any[]): Promise<any>;
  exists(...args: any[]): Promise<any>;
  findAll(...args: any[]): Promise<any>;
  findAllByTenant(...args: any[]): Promise<any>;
  findById(...args: any[]): Promise<any>;
  paginate(...args: any[]): Promise<any>;
  setCurrent(...args: any[]): Promise<any>;
  softDelete(...args: any[]): Promise<any>;
  update(...args: any[]): Promise<any>;
}
