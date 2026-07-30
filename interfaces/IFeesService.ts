// interfaces/IFeesService.ts
import type { FeeEntity } from "@/entities/fee.entity";
import type { CreateFeeDTO, UpdateFeeDTO } from "@/dto";
import type { PaginatedResult } from "@/types/api";

export interface IFeesService {
  createFee(data: CreateFeeDTO, tenantId: string, userId?: string): Promise<FeeEntity>;
  getFeeById(tenantId: string, id: string): Promise<FeeEntity | null>;
  listFees(tenantId: string, studentId?: string, page?: number, limit?: number): Promise<PaginatedResult<FeeEntity>>;
  updateFee(tenantId: string, id: string, data: UpdateFeeDTO, userId?: string): Promise<FeeEntity>;
  deleteFee(tenantId: string, id: string, userId?: string): Promise<void>;
  findByStudent(tenantId: string, studentId: string, limit?: number): Promise<FeeEntity[]>;
  getTotalRevenue(tenantId: string): Promise<number>;
  getRecentPayments(tenantId: string, limit?: number): Promise<FeeEntity[]>;
}
