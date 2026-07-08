// interfaces/IStaffRepository.ts
import { Staff } from "@/types/staff";
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
  countByDepartment(tenantId: string, department: string): Promise<number>;
}
