// interfaces/IAttendanceRepository.ts
import type { AttendanceDocument } from "@/documents/AttendanceDocument";
import type { AttendanceEntity } from "@/entities/attendance.entity";
import type { PaginatedResult } from "@/types/api";

export interface IAttendanceRepository {
  findAll(tenantId: string): Promise<(AttendanceDocument & { id: string })[]>;
  findById(id: string, tenantId: string): Promise<(AttendanceDocument & { id: string }) | null>;
  save(document: AttendanceDocument, tenantId: string): Promise<AttendanceDocument>;
  create(data: Omit<AttendanceDocument, 'id' | 'createdAt' | 'updatedAt'>, tenantId: string): Promise<string>;
  update(id: string, document: Partial<AttendanceDocument>, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
  count(tenantId: string): Promise<number>;
  exists(id: string, tenantId: string): Promise<boolean>;
  findWithFilters(tenantId: string, filters?: {
    date?: string;
    classGrade?: string;
    section?: string;
    studentId?: string;
    dateRange?: { gte: string; lte: string };
  }): Promise<AttendanceDocument[]>;
  findByStudentId(tenantId: string, studentId: string): Promise<(AttendanceDocument & { id: string })[]>;
  findByStudentIds(tenantId: string, studentIds: string[], limit?: number): Promise<(AttendanceDocument & { id: string })[]>;
  bulkCreate(documents: AttendanceDocument[], tenantId: string): Promise<string[]>;
  paginate(tenantId: string, page: number, limit: number): Promise<PaginatedResult<AttendanceDocument>>;
}
