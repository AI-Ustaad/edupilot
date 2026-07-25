// interfaces/IStudentRepository.ts
import type { StudentDocument } from "@/documents/StudentDocument";
import type { StudentAnalytics, TimelineEntry, StudentFilter } from "@/types/student";
import type { PaginatedResult } from "@/types/api";

export interface IStudentRepository {
  create(document: StudentDocument, tenantId: string): Promise<string>;
  save(document: StudentDocument, tenantId: string): Promise<StudentDocument>;
  update(id: string, document: Partial<StudentDocument>, tenantId: string): Promise<void>;
  findById(id: string, tenantId: string): Promise<StudentDocument | null>;
  findAll(tenantId: string): Promise<(StudentDocument & { id: string })[]>;
  count(tenantId: string): Promise<number>;
  findByRollNumber(rollNumber: string, tenantId: string): Promise<StudentDocument | null>;
  paginate(tenantId: string, page: number, limit: number): Promise<PaginatedResult<StudentDocument>>;
  softDelete(id: string, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;

  findByClass(className: string, tenantId: string): Promise<StudentDocument[]>;
  findBySection(className: string, section: string, tenantId: string): Promise<StudentDocument[]>;
  search(tenantId: string, query: string): Promise<StudentDocument[]>;
  countByClass(tenantId: string): Promise<Record<string, number>>;
  findActiveStudents(tenantId: string): Promise<StudentDocument[]>;
  batchFindByIds(tenantId: string, ids: string[]): Promise<StudentDocument[]>;
  countByClassAndSection(tenantId: string): Promise<Record<string, Record<string, number>>>;

  findByAdmissionNo(admissionNo: string, tenantId: string): Promise<StudentDocument | null>;
  findByStatus(status: string, tenantId: string): Promise<StudentDocument[]>;
  findByHouse(house: string, tenantId: string): Promise<StudentDocument[]>;
  findByParent(parentId: string, tenantId: string): Promise<StudentDocument[]>;
  findByTransport(transportRouteId: string, tenantId: string): Promise<StudentDocument[]>;
  findByHostel(hostelId: string, tenantId: string): Promise<StudentDocument[]>;
  findGraduated(tenantId: string): Promise<StudentDocument[]>;
  findTransferred(tenantId: string): Promise<StudentDocument[]>;
  findDeleted(tenantId: string): Promise<StudentDocument[]>;

  advancedFilter(tenantId: string, filter: StudentFilter): Promise<PaginatedResult<StudentDocument>>;
  bulkUpdate(tenantId: string, ids: string[], data: Partial<StudentDocument>): Promise<void>;
  bulkDelete(tenantId: string, ids: string[]): Promise<void>;
  archive(tenantId: string, id: string): Promise<void>;
  restore(tenantId: string, id: string): Promise<void>;
  studentAnalytics(tenantId: string): Promise<StudentAnalytics>;
  timeline(tenantId: string, studentId: string): Promise<TimelineEntry[]>;
}
