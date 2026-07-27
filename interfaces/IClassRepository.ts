// interfaces/IClassRepository.ts
export interface IClassRepository {
  bulkCreate(...args: any[]): Promise<any>;
  count(...args: any[]): Promise<any>;
  create(...args: any[]): Promise<any>;
  createClass(...args: any[]): Promise<any>;
  delete(...args: any[]): Promise<any>;
  deleteClass(...args: any[]): Promise<any>;
  exists(...args: any[]): Promise<any>;
  findAll(...args: any[]): Promise<any>;
  findById(...args: any[]): Promise<any>;
  getAll(...args: any[]): Promise<any>;
  paginate(...args: any[]): Promise<any>;
  softDelete(...args: any[]): Promise<any>;
  update(...args: any[]): Promise<any>;
}
