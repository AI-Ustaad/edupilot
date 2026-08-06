// interfaces/IClassService.ts
export interface IClassService {
  getAllClasses(tenantId: string): Promise<any[]>;
  createClass(data: { classGrade: string; sectionName: string; subjects?: { core: string[]; electives: string[] }; createdBy?: string }, tenantId: string): Promise<string>;
  deleteClass(id: string, tenantId: string): Promise<void>;
}
