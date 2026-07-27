// interfaces/IAttendanceRepository.ts
export interface IAttendanceRepository {
  bulkCreate(...args: any[]): Promise<any>;
  count(...args: any[]): Promise<any>;
  create(...args: any[]): Promise<any>;
  delete(...args: any[]): Promise<any>;
  exists(...args: any[]): Promise<any>;
  findAll(...args: any[]): Promise<any>;
  findById(...args: any[]): Promise<any>;
  findByStudentId(...args: any[]): Promise<any>;
  findByStudentIds(...args: any[]): Promise<any>;
  findWithFilters(...args: any[]): Promise<any>;
  paginate(...args: any[]): Promise<any>;
  save(...args: any[]): Promise<any>;
  softDelete(...args: any[]): Promise<any>;
  update(...args: any[]): Promise<any>;
}
