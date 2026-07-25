// interfaces/IStudentService.ts
import type { StudentEntity, Student360Aggregate, StudentComment, TimelineEntry } from "@/entities/student.entity";
import type { CreateStudentDTO, UpdateStudentDTO } from "@/dto";
import type { StudentAnalytics } from "@/types/student";
import type { PaginatedResult } from "@/types/api";

export interface IStudentService {
  create(data: CreateStudentDTO, tenantId: string, userId: string): Promise<StudentEntity>;
  update(tenantId: string, studentId: string, data: UpdateStudentDTO, userId: string): Promise<StudentEntity | null>;
  getById(tenantId: string, studentId: string): Promise<StudentEntity | null>;
  paginate(tenantId: string, page: number, limit: number): Promise<PaginatedResult<StudentEntity>>;
  delete(tenantId: string, studentId: string, userId?: string): Promise<void>;
  hardDelete(tenantId: string, studentId: string, userId: string): Promise<void>;
  approveAdmission(tenantId: string, studentId: string, userId: string): Promise<void>;
  rejectAdmission(tenantId: string, studentId: string, userId: string): Promise<void>;

  student360(tenantId: string, studentId: string): Promise<Student360Aggregate | null>;
  addComment(tenantId: string, studentId: string, comment: string, userId: string): Promise<void>;
  promote(tenantId: string, studentIds: string[], newClass: string, newSection: string, academicYear: string, userId: string): Promise<{ success: boolean; promoted: number; errors: string[] }>;
  archive(tenantId: string, studentId: string, userId: string): Promise<void>;
  restore(tenantId: string, studentId: string, userId: string): Promise<void>;
  getTimeline(tenantId: string, studentId: string): Promise<TimelineEntry[]>;
  bulkImport(tenantId: string, data: unknown[], userId: string): Promise<{ success: boolean; imported: number }>;
  bulkCreate(tenantId: string, students: unknown[], userId: string): Promise<{ success: boolean; created: number; failed: number; results: any[] }>;
  analytics(tenantId: string): Promise<StudentAnalytics>;

  count(tenantId: string): Promise<number>;
  countByClass(tenantId: string): Promise<Record<string, number>>;
  getAnalytics(tenantId: string): Promise<StudentAnalytics>;
  getRiskData(tenantId: string): Promise<StudentEntity[]>;
}
