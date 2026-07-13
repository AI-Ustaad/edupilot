// services/fees.service.ts
import { FeesRepository } from "@/repositories/fees.repository";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";
import { CreateFeeSchema, UpdateFeeSchema } from "@/validators/fees";
import { invalidateCache } from "@/lib/cache";
import { eventBus } from "@/lib/events/event-bus";
import { EVENTS } from "@/lib/events/event-types";
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
    const parsed = this.validation.validateOrThrow(CreateFeeSchema, data);

    const createData = {
      ...parsed,
      tenantId,
      createdAt: new Date(),
    } as unknown as Omit<Fee, "id" | "updatedAt">;

    const id = await this.repo.create(createData as any, tenantId);
    const fee = await this.repo.findById(id, tenantId);
    if (!fee) throw new Error("Fee record created but could not be retrieved");

    await invalidateCache(`dashboard:${tenantId}`);
    await invalidateCache(`fees:${tenantId}`);

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

    eventBus.publish(EVENTS.FEE_COLLECTED, {
      tenantId,
      feeId: id,
      studentId: parsed.studentId,
      amount: parsed.amountPaid,
      month: parsed.feeMonth,
      collectedBy: userId,
    });

    return fee as Fee;
  }

  async getFeeById(id: string, tenantId: string): Promise<(Fee & { id: string }) | null> {
    return this.repo.findById(id, tenantId);
  }

  async listFees(tenantId: string, studentId?: string, page = 1, limit = 20) {
    let fees: (Fee & { id: string })[];

    if (studentId) {
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
    const parsed = this.validation.validateOrThrow(UpdateFeeSchema, data);

    await this.repo.update(id, parsed, tenantId);
    const updated = await this.repo.findById(id, tenantId);
    if (!updated) throw new Error("Fee record not found after update");

    await invalidateCache(`dashboard:${tenantId}`);
    await invalidateCache(`fees:${tenantId}`);

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

    eventBus.publish(EVENTS.FEE_UPDATED, {
      tenantId,
      feeId: id,
      updates: parsed,
      updatedBy: userId,
    });

    return updated as Fee;
  }

  async deleteFee(id: string, tenantId: string, userId?: string): Promise<void> {
    const fee = await this.repo.findById(id, tenantId);
    await this.repo.delete(id, tenantId);

    await invalidateCache(`dashboard:${tenantId}`);
    await invalidateCache(`fees:${tenantId}`);

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

    eventBus.publish(EVENTS.FEE_DELETED, {
      tenantId,
      feeId: id,
      studentId: (fee as any)?.studentId,
      deletedBy: userId,
    });
  }

  async getTotalRevenue(tenantId: string): Promise<number> {
    return (this.repo as FeesRepository).getTotalRevenue(tenantId);
  }

  async getRecentPayments(tenantId: string, limit = 5): Promise<any[]> {
    const fees = await (this.repo as FeesRepository).getRecentPayments(tenantId, limit);
    return fees.map(fee => ({
      id: fee.id,
      studentName: (fee as any).studentName || "Unknown",
      amount: (fee as any).amountPaid || 0,
      date: (fee as any).feeMonth || "",
      timestamp: (fee as any).createdAt?.toDate?.().toISOString() || "",
    }));
  }
}
