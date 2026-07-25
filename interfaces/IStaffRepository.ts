// interfaces/IStaffRepository.ts
import type { StaffDocument } from "@/documents/StaffDocument";
import type { StaffFilter, StaffAnalytics, StaffTimelineEntry } from "@/types/staff";
import type { PaginatedResult } from "@/types/api";

export interface IStaffRepository {
  findAll(tenantId: string): Promise<(StaffDocument & { id: string })[]>;
  findById(id: string, tenantId: string): Promise<(StaffDocument & { id: string }) | null>;
  create(data: Omit<StaffDocument, 'id' | 'createdAt' | 'updatedAt'>, tenantId: string): Promise<string>;
  save(document: StaffDocument, tenantId: string): Promise<StaffDocument>;
  update(id: string, document: Partial<StaffDocument>, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
  softDelete(id: string, tenantId: string): Promise<void>;
  paginate(
    tenantId: string,
    page: number,
    limit: number,
    orderBy?: string,
    direction?: "asc" | "desc"
  ): Promise<PaginatedResult<StaffDocument>>;
  count(tenantId: string): Promise<number>;
  exists(id: string, tenantId: string): Promise<boolean>;
  search(tenantId: string, query: string): Promise<(StaffDocument & { id: string })[]>;
  findByEmail(tenantId: string, email: string): Promise<(StaffDocument & { id: string }) | null>;

  findByEmployeeId(employeeId: string, tenantId: string): Promise<(StaffDocument & { id: string }) | null>;
  findByCategory(category: string, tenantId: string): Promise<(StaffDocument & { id: string })[]>;
  findByDepartment(department: string, tenantId: string): Promise<(StaffDocument & { id: string })[]>;
  findByDesignation(designation: string, tenantId: string): Promise<(StaffDocument & { id: string })[]>;
  findByStatus(status: string, tenantId: string): Promise<(StaffDocument & { id: string })[]>;
  findByCampus(campus: string, tenantId: string): Promise<(StaffDocument & { id: string })[]>;
  findByRole(role: string, tenantId: string): Promise<(StaffDocument & { id: string })[]>;
  advancedFilter(tenantId: string, filter: StaffFilter): Promise<PaginatedResult<StaffDocument>>;
  bulkUpdate(tenantId: string, ids: string[], data: Partial<StaffDocument>): Promise<void>;
  bulkDelete(tenantId: string, ids: string[]): Promise<void>;
  archive(tenantId: string, id: string): Promise<void>;
  restore(tenantId: string, id: string): Promise<void>;
  staffAnalytics(tenantId: string): Promise<StaffAnalytics>;
  timeline(tenantId: string, staffId: string): Promise<StaffTimelineEntry[]>;
}
