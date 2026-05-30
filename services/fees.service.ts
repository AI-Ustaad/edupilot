// services/fees.service.ts
import { FeesRepository } from "@/repositories/fees.repository";
import { Fee } from "@/types/fees";
import {
  CreateFeeSchema,
  UpdateFeeSchema,
} from "@/lib/validation"; // barrel export
import { ZodError } from "zod";

export class FeesService {
  constructor(private repo: FeesRepository) {}

  // ------------------ CREATE ------------------
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

    const createData = {
      ...validated,
      tenantId,
      createdAt: new Date(),
    } as Omit<Fee, "id" | "updatedAt">;

    const id = await this.repo.create(createData as any, tenantId);
    const fee = await this.repo.findById(id, tenantId);
    if (!fee) throw new Error("Fee record created but could not be retrieved");
    return fee as Fee;
  }

  // ------------------ READ ------------------
  async getFeeById(id: string, tenantId: string): Promise<Fee | null> {
    return this.repo.findById(id, tenantId);
  }

  async listFees(
    tenantId: string,
    studentId?: string,
    page = 1,
    limit = 20
  ) {
    // پورا ڈیٹا لے کر دستی فلٹر + pagination
    let fees = await this.repo.findAll(tenantId);

    if (studentId) {
      fees = fees.filter(f => (f as any).studentId === studentId);
    }

    // تاریخ کے حساب سے ترتیب (نئی پہلے) – اختیاری
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

  // ------------------ UPDATE ------------------
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
    return updated as Fee;
  }

  // ------------------ DELETE ------------------
  async deleteFee(id: string, tenantId: string): Promise<void> {
    // فی الحال مکمل حذف، بعد میں softDelete پر جا سکتے ہیں
    await this.repo.delete(id, tenantId);
  }
}
