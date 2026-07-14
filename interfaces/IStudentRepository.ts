// interfaces/IStudentRepository.ts
import { Student, StudentFilter, StudentAnalytics, TimelineEntry } from "@/types/student";
import { PaginatedResult } from "@/types/api";

export interface IStudentRepository {
  findAll(tenantId: string): Promise<(Student & { id: string })[]>;
  findById(id: string, tenantId: string): Promise<(Student & { id: string }) | null>;
  create(data: Omit<Student, "id" | "createdAt" | "updatedAt">, tenantId: string): Promise<string>;
  update(id: string, data: Partial<Student>, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
  softDelete(id: string, tenantId: string): Promise<void>;
  paginate(
    tenantId: string,
    page: number,
    limit: number,
    orderBy?: string,
    direction?: "asc" | "desc"
  ): Promise<PaginatedResult<Student & { id: string }>>;
  count(tenantId: string): Promise<number>;
  exists(id: string, tenantId: string): Promise<boolean>;
  search(tenantId: string, query: string): Promise<(Student & { id: string })[]>;
  findByRollNumber(rollNumber: number, tenantId: string): Promise<(Student & { id: string }) | null>;
  findByClass(className: string, tenantId: string): Promise<(Student & { id: string })[]>;
  findBySection(className: string, section: string, tenantId: string): Promise<(Student & { id: string })[]>;
  countByClass(tenantId: string): Promise<Record<string, number>>;
  bulkCreate(
    dataArray: Omit<Student, "id" | "createdAt" | "updatedAt">[],
    tenantId: string
  ): Promise<string[]>;
  findActiveStudents(tenantId: string): Promise<(Student & { id: string })[]>;
  batchFindByIds(tenantId: string, ids: string[]): Promise<(Student & { id: string })[]>;
  countByClassAndSection(tenantId: string): Promise<Record<string, Record<string, number>>>;
  // Enterprise methods
  findByAdmissionNo(admissionNo: string, tenantId: string): Promise<(Student & { id: string }) | null>;
  findByStatus(status: string, tenantId: string): Promise<(Student & { id: string })[]>;
  findByHouse(house: string, tenantId: string): Promise<(Student & { id: string })[]>;
  findByParent(parentId: string, tenantId: string): Promise<(Student & { id: string })[]>;
  findByTransport(transportRouteId: string, tenantId: string): Promise<(Student & { id: string })[]>;
  findByHostel(hostelId: string, tenantId: string): Promise<(Student & { id: string })[]>;
  findGraduated(tenantId: string): Promise<(Student & { id: string })[]>;
  findTransferred(tenantId: string): Promise<(Student & { id: string })[]>;
  findDeleted(tenantId: string): Promise<(Student & { id: string })[]>;
  advancedFilter(tenantId: string, filter: StudentFilter): Promise<PaginatedResult<Student & { id: string }>>;
  bulkUpdate(tenantId: string, ids: string[], data: Partial<Student>): Promise<void>;
  bulkDelete(tenantId: string, ids: string[]): Promise<void>;
  archive(tenantId: string, id: string): Promise<void>;
  restore(tenantId: string, id: string): Promise<void>;
  studentAnalytics(tenantId: string): Promise<StudentAnalytics>;
  timeline(tenantId: string, studentId: string): Promise<TimelineEntry[]>;
}
