// interfaces/IStudentRepository.ts
export interface IStudentRepository {
  advancedFilter(...args: any[]): Promise<any>;
  archive(...args: any[]): Promise<any>;
  batchFindByIds(...args: any[]): Promise<any>;
  bulkCreate(...args: any[]): Promise<any>;
  bulkDelete(...args: any[]): Promise<any>;
  bulkUpdate(...args: any[]): Promise<any>;
  count(...args: any[]): Promise<any>;
  countByClass(...args: any[]): Promise<any>;
  countByClassAndSection(...args: any[]): Promise<any>;
  create(...args: any[]): Promise<any>;
  delete(...args: any[]): Promise<any>;
  exists(...args: any[]): Promise<any>;
  findActiveStudents(...args: any[]): Promise<any>;
  findAll(...args: any[]): Promise<any>;
  findByAdmissionNo(...args: any[]): Promise<any>;
  findByClass(...args: any[]): Promise<any>;
  findByHostel(...args: any[]): Promise<any>;
  findByHouse(...args: any[]): Promise<any>;
  findById(...args: any[]): Promise<any>;
  findByParent(...args: any[]): Promise<any>;
  findByRollNumber(...args: any[]): Promise<any>;
  findBySection(...args: any[]): Promise<any>;
  findByStatus(...args: any[]): Promise<any>;
  findByTransport(...args: any[]): Promise<any>;
  findDeleted(...args: any[]): Promise<any>;
  findGraduated(...args: any[]): Promise<any>;
  findTransferred(...args: any[]): Promise<any>;
  paginate(...args: any[]): Promise<any>;
  restore(...args: any[]): Promise<any>;
  save(...args: any[]): Promise<any>;
  search(...args: any[]): Promise<any>;
  softDelete(...args: any[]): Promise<any>;
  studentAnalytics(...args: any[]): Promise<any>;
  timeline(...args: any[]): Promise<any>;
  update(...args: any[]): Promise<any>;
}
