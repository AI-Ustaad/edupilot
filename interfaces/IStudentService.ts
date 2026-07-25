// interfaces/IStudentService.ts
import type { StudentEntity } from "@/entities/StudentEntity";
import type { CreateStudentDTO, UpdateStudentDTO } from "@/dto";

export interface IStudentService {
  create(data: CreateStudentDTO, tenantId: string, userId: string): Promise<StudentEntity>;
  update(studentId: string, data: UpdateStudentDTO, tenantId: string, userId: string): Promise<StudentEntity | null>;
  getById(tenantId: string, studentId: string): Promise<StudentEntity | null>;
  paginate(tenantId: string, page: number, limit: number): Promise<any>;
  delete(tenantId: string, studentId: string, userId?: string): Promise<void>;
  hardDelete(tenantId: string, studentId: string, userId: string): Promise<void>;
  approveAdmission(tenantId: string, studentId: string, userId: string): Promise<void>;
  rejectAdmission(tenantId: string, studentId: string, userId: string): Promise<void>;
  
  // Future Stubs (Phase 4)
  student360(tenantId: string, studentId: string): Promise<any>;
  addComment(tenantId: string, studentId: string, comment: string, userId: string): Promise<void>;
  promote(tenantId: string, studentIds: string[], newClass: string, newSection: string, userId: string): Promise<any>;
  archive(tenantId: string, studentId: string, userId: string): Promise<void>;
  restore(tenantId: string, studentId: string, userId: string): Promise<void>;
  getTimeline(tenantId: string, studentId: string): Promise<any[]>;
  bulkImport(tenantId: string, data: any[], userId: string): Promise<any>;
  analytics(tenantId: string): Promise<any>;
}
