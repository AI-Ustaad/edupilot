import { FeesRepository } from "@/repositories/fees.repository";
import { Fee } from "@/types/fees";
import { CreateFeeSchema, UpdateFeeSchema } from "@/lib/validation";
import { ZodError } from "zod";
import { deleteCache, feeListKey, dashboardKey } from "@/lib/cache/cache";

export class FeesService {
  constructor(private repo: FeesRepository) {}

  async createFee(data: unknown, tenantId: string): Promise<Fee> {
    let validated;
    try {
      validated = CreateFeeSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }

    const createData = { ...validated, tenantId, createdAt: new Date() } as Omit<Fee, "id" | "updatedAt">;
    const id = await this.repo.create(createData as any, tenantId);
    const fee = await this.repo.findById(id, tenantId);
    if (!fee) throw new Error("Fee record created but could not be retrieved");

    // Invalidate caches
    await deleteCache(feeListKey(tenantId));
    if ((fee as any).studentId) {
      await deleteCache(feeListKey(tenantId, (fee as any).studentId));
    }
    await deleteCache(dashboardKey(tenantId));

    return fee as Fee;
  }

  async getFeeById(id: string, tenantId: string): Promise<Fee | null> {
    return this.repo.findById(id, tenantId);
  }

  async listFees(tenantId: string, studentId?: string, page = 1, limit = 20) {
    // (اختیاری: cache read)
    let fees = await this.repo.findAll(tenantId);
    if (studentId) {
      fees = fees.filter(f => (f as any).studentId === studentId);
    }
    fees.sort((a, b) => {
      const dateA = (a as any).createdAt?.toDate?.() || 0;
      const dateB = (b as any).createdAt?.toDate?.() || 0;
      return dateB - dateA;
    });
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

  async updateFee(id: string, data: unknown, tenantId: string): Promise<Fee> {
    let validated;
    try {
      validated = UpdateFeeSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }

    await this.repo.update(id, validated, tenantId);
    const updated = await this.repo.findById(id, tenantId);
    if (!updated) throw new Error("Fee record not found after update");

    // Invalidate caches
    await deleteCache(feeListKey(tenantId));
    if ((updated as any).studentId) {
      await deleteCache(feeListKey(tenantId, (updated as any).studentId));
    }
    await deleteCache(dashboardKey(tenantId));

    return updated as Fee;
  }

  async deleteFee(id: string, tenantId: string): Promise<void> {
    // اصل دستاویز کی معلومات نکال لیں (بعد میں cache key بنانے کے لیے)
    const fee = await this.repo.findById(id, tenantId);
    await this.repo.delete(id, tenantId);

    if (fee) {
      await deleteCache(feeListKey(tenantId));
      if ((fee as any).studentId) {
        await deleteCache(feeListKey(tenantId, (fee as any).studentId));
      }
      await deleteCache(dashboardKey(tenantId));
    }
  }

  async getTotalRevenue(tenantId: string): Promise<number> {
    const allFees = await this.repo.findAll(tenantId);
    return allFees.reduce((sum, fee) => sum + ((fee as any).amountPaid || 0), 0);
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
      studentName: (fee as any).studentName || 'Unknown',
      amount: (fee as any).amountPaid || 0,
      date: (fee as any).feeMonth || '',
      timestamp: (fee as any).createdAt?.toDate?.().toISOString() || '',
    }));
  }
}
