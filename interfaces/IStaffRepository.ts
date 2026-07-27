// interfaces/IStaffRepository.ts
export interface IStaffRepository {
  advancedFilter(...args: any[]): Promise<any>;
  archive(...args: any[]): Promise<any>;
  bulkCreate(...args: any[]): Promise<any>;
  bulkDelete(...args: any[]): Promise<any>;
  bulkUpdate(...args: any[]): Promise<any>;
  count(...args: any[]): Promise<any>;
  create(...args: any[]): Promise<any>;
  delete(...args: any[]): Promise<any>;
  exists(...args: any[]): Promise<any>;
  findAll(...args: any[]): Promise<any>;
  findByCampus(...args: any[]): Promise<any>;
  findByCategory(...args: any[]): Promise<any>;
  findByDepartment(...args: any[]): Promise<any>;
  findByDesignation(...args: any[]): Promise<any>;
  findByEmail(...args: any[]): Promise<any>;
  findByEmployeeId(...args: any[]): Promise<any>;
  findById(...args: any[]): Promise<any>;
  findByRole(...args: any[]): Promise<any>;
  findByStatus(...args: any[]): Promise<any>;
  paginate(...args: any[]): Promise<any>;
  restore(...args: any[]): Promise<any>;
  save(...args: any[]): Promise<any>;
  search(...args: any[]): Promise<any>;
  softDelete(...args: any[]): Promise<any>;
  staffAnalytics(...args: any[]): Promise<any>;
  timeline(...args: any[]): Promise<any>;
  update(...args: any[]): Promise<any>;
}
