// interfaces/IStaffService.ts
import type { StaffEntity, StaffTimelineEntry } from "@/entities/staff.entity";
import type { CreateStaffDTO, UpdateStaffDTO } from "@/dto";
import type { StaffAnalytics, StaffFilter } from "@/types/staff";
import type { PaginatedResult } from "@/types/api";

export interface IStaffService {
  list(tenantId: string): Promise<StaffEntity[]>;
  paginate(tenantId: string, page: number, limit: number): Promise<PaginatedResult<StaffEntity>>;
  getById(tenantId: string, id: string): Promise<StaffEntity>;
  create(data: CreateStaffDTO, tenantId: string, userId: string): Promise<string>;
  update(tenantId: string, id: string, data: UpdateStaffDTO, userId?: string): Promise<void>;
  delete(tenantId: string, id: string, userId?: string): Promise<void>;
  count(tenantId: string): Promise<number>;
  exists(id: string, tenantId: string): Promise<boolean>;
  search(tenantId: string, query: string): Promise<StaffEntity[]>;
  checkSubscriptionLimit(tenantId: string, maxStaff: number): Promise<void>;

  hire(data: CreateStaffDTO, tenantId: string, userId: string): Promise<string>;
  promote(tenantId: string, staffId: string, newDesignation: string, newDepartment: string | undefined, userId: string): Promise<void>;
  transfer(tenantId: string, staffId: string, reason: string, userId: string): Promise<void>;
  terminate(tenantId: string, staffId: string, reason: string, userId: string): Promise<void>;
  archive(tenantId: string, staffId: string, userId: string): Promise<void>;
  restore(tenantId: string, staffId: string, userId: string): Promise<void>;
  bulkUpdate(tenantId: string, ids: string[], data: UpdateStaffDTO, userId: string): Promise<void>;
  bulkDelete(tenantId: string, ids: string[], userId: string): Promise<void>;
  bulkCreate(tenantId: string, staff: CreateStaffDTO[], userId: string): Promise<{ success: boolean; created: number; failed: number; results: any[] }>;

  getAnalytics(tenantId: string): Promise<StaffAnalytics>;
  getTimeline(tenantId: string, staffId: string): Promise<StaffTimelineEntry[]>;
  advancedFilter(tenantId: string, filter: StaffFilter): Promise<{ data: StaffEntity[]; total: number; page: number; totalPages: number }>;

  getAttendance(tenantId: string, staffId: string): Promise<any>;
  getLeave(tenantId: string, staffId: string): Promise<any>;
  getPayroll(tenantId: string, staffId: string): Promise<any>;
  getAISummary(tenantId: string, staffId: string): Promise<any>;
}
