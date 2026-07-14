// interfaces/IStaffRepository.ts
import { Staff, StaffFilter, StaffAnalytics, StaffTimelineEntry } from "@/types/staff";
import { PaginatedResult } from "@/types/api";

export interface IStaffRepository {
  findAll(tenantId: string): Promise<(Staff & { id: string })[]>;
  findById(id: string, tenantId: string): Promise<(Staff & { id: string }) | null>;
  create(data: Omit<Staff, "id" | "createdAt" | "updatedAt">, tenantId: string): Promise<string>;
  update(id: string, data: Partial<Staff>, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
  softDelete(id: string, tenantId: string): Promise<void>;
  paginate(
    tenantId: string,
    page: number,
    limit: number,
    orderBy?: string,
    direction?: "asc" | "desc"
  ): Promise<PaginatedResult<Staff & { id: string }>>;
  count(tenantId: string): Promise<number>;
  exists(id: string, tenantId: string): Promise<boolean>;
  search(tenantId: string, query: string): Promise<(Staff & { id: string })[]>;
  findByEmail(tenantId: string, email: string): Promise<(Staff & { id: string }) | null>;

  // Enterprise methods
  findByEmployeeId(employeeId: string, tenantId: string): Promise<(Staff & { id: string }) | null>;
  findByCategory(category: string, tenantId: string): Promise<(Staff & { id: string })[]>;
  findByDepartment(department: string, tenantId: string): Promise<(Staff & { id: string })[]>;
  findByDesignation(designation: string, tenantId: string): Promise<(Staff & { id: string })[]>;
  findByStatus(status: string, tenantId: string): Promise<(Staff & { id: string })[]>;
  findByCampus(campus: string, tenantId: string): Promise<(Staff & { id: string })[]>;
  findByRole(role: string, tenantId: string): Promise<(Staff & { id: string })[]>;
  advancedFilter(tenantId: string, filter: StaffFilter): Promise<{ data: (Staff & { id: string })[]; total: number; page: number; totalPages: number }>;
  bulkUpdate(tenantId: string, ids: string[], data: Partial<Staff>): Promise<void>;
  bulkDelete(tenantId: string, ids: string[]): Promise<void>;
  archive(tenantId: string, id: string): Promise<void>;
  restore(tenantId: string, id: string): Promise<void>;
  staffAnalytics(tenantId: string): Promise<StaffAnalytics>;
  timeline(tenantId: string, staffId: string): Promise<StaffTimelineEntry[]>;
}
