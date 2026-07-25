// interfaces/IFeesRepository.ts
import type { FeeDocument } from "@/documents/FeeDocument";
import type { PaginatedResult } from "@/types/api";

export interface IFeesRepository {
  findAll(tenantId: string): Promise<(FeeDocument & { id: string })[]>;
  findById(id: string, tenantId: string): Promise<(FeeDocument & { id: string }) | null>;
  create(data: Omit<FeeDocument, 'id' | 'createdAt' | 'updatedAt'>, tenantId: string): Promise<string>;
  save(document: FeeDocument, tenantId: string): Promise<FeeDocument>;
  update(id: string, document: Partial<FeeDocument>, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
  count(tenantId: string): Promise<number>;
  exists(id: string, tenantId: string): Promise<boolean>;
  findByStudent(tenantId: string, studentId: string, limit?: number): Promise<(FeeDocument & { id: string })[]>;
  findWithFilters(tenantId: string, filters?: { studentId?: string; paid?: boolean; dueBefore?: string }): Promise<(FeeDocument & { id: string })[]>;
  getTotalRevenue(tenantId: string): Promise<number>;
  getRecentPayments(tenantId: string, limit?: number): Promise<(FeeDocument & { id: string })[]>;
  paginate(tenantId: string, page: number, limit: number): Promise<PaginatedResult<FeeDocument>>;
}
