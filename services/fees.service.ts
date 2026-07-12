// services/fees.service.ts
import { FeesRepository } from "@/repositories/fees.repository";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";
import { CreateFeeSchema, UpdateFeeSchema } from "@/validators/fees";
import { invalidateCache } from "@/lib/cache";
import type { IFeesRepository } from "@/interfaces/IFeesRepository";
import type { Fee } from "@/types/fees";

export class FeesService {
  private audit: AuditService;
  private validation: ValidationService;

  constructor(private repo: IFeesRepository = new FeesRepository()) {
    this.audit = new AuditService();
    this.validation = new ValidationService();
  }

  async createFee(data: unknown, tenantId: string, userId?: string): Promise<Fee> {
    const validation = this.validation.validate(CreateFeeSchema, data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors?.map(e => e.message).join(", ")}`);
    }
    const parsed = validation.data;

    const createData = {
      ...parsed,
      tenantId,
      createdAt: new Date(),
    } as unknown as Omit<Fee, "id" | "updatedAt">;

    const id = await this.repo.create(createData as any, tenantId);
    const fee = await this.repo.findById(id, tenantId);
    if (!fee) throw new Error("Fee record created but could not be retrieved");

    await invalidateCache(`dashboard:${tenantId}`);

    if (userId) {
      await this.audit.log({
        action: "fee.created",
        userId,
        tenantId,
        entityId: id,
        entityType: "fee",
        metadata: { studentId: parsed.studentId, amount: parsed.amountPaid, month: parsed.feeMonth },
      });
    }

    return fee as Fee;
  }

  async getFeeById(id: string, tenantId: string): Promise<(Fee & { id: string }) | null> {
    return this.repo.findById(id, tenantId);
  }

  async listFees(tenantId: string, studentId?: string, page = 1, limit = 20) {
    let fees: (Fee & { id: string })[];

    if (studentId) {
      // Use optimized Firestore query instead of fetching all + filtering in-memory
      fees = await (this.repo as FeesRepository).findByStudent(tenantId, studentId, page * limit);
    } else {
      fees = await this.repo.findAll(tenantId);
      fees.sort((a, b) => {
        const dateA = (a as any).createdAt?.toDate?.() || 0;
        const dateB = (b as any).createdAt?.toDate?.() || 0;
        return dateB - dateA;
      });
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      data: fees.slice(start, end),
      total: fees.length,
      page,
      limit,
      totalPages: Math.ceil(fees.length / limit),
    };
  }

  async updateFee(id: string, data: unknown, tenantId: string, userId?: string): Promise<Fee> {
    const validation = this.validation.validate(UpdateFeeSchema, data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors?.map(e => e.message).join(", ")}`);
    }
    const parsed = validation.data;

    await this.repo.update(id, parsed, tenantId);
    const updated = await this.repo.findById(id, tenantId);
    if (!updated) throw new Error("Fee record not found after update");

    await invalidateCache(`dashboard:${tenantId}`);

    if (userId) {
      await this.audit.log({
        action: "fee.updated",
        userId,
        tenantId,
        entityId: id,
        entityType: "fee",
        metadata: { updates: parsed },
      });
    }

    return updated as Fee;
  }

  async deleteFee(id: string, tenantId: string, userId?: string): Promise<void> {
    const fee = await this.repo.findById(id, tenantId);
    await this.repo.delete(id, tenantId);

    await invalidateCache(`dashboard:${tenantId}`);

    if (userId) {
      await this.audit.log({
        action: "fee.deleted",
        userId,
        tenantId,
        entityId: id,
        entityType: "fee",
        metadata: { studentName: (fee as any)?.studentName, amount: (fee as any)?.amountPaid },
      });
    }
  }

  async getTotalRevenue(tenantId: string): Promise<number> {
    const allFees = await this.repo.findAll(tenantId);
    return allFees.reduce((sum, fee) => sum + (fee.amountPaid || 0), 0);
  }

  async getRecentPayments(tenantId: string, limit = 5): Promise<any[]> {
    const allFees = await this.repo.findAll(tenantId);
    allFees.sort((a, b) => {
      const dateA = (a as any).createdAt?.toDate?.() || 0;
      const dateB = (b as any).createdAt?.toDate?.() || 0;
      return dateB - dateA;
    });
    return allFees.slice(0, limit).map(fee => ({
      id: fee.id,
      studentName: fee.studentName || "Unknown",
      amount: fee.amountPaid || 0,
      date: fee.feeMonth || "",
      timestamp: (fee as any).createdAt?.toDate?.().toISOString() || "",
    }));
  }
}

