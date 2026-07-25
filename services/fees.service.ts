// services/fees.service.ts
import { FeesRepository } from "@/repositories/fees.repository";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";
import { CreateFeeSchema, UpdateFeeSchema } from "@/validators/fees";
import { invalidateCache } from "@/lib/cache";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";
import type { IFeesRepository } from "@/interfaces/IFeesRepository";
import type { IFeesService } from "@/interfaces/IFeesService";
import type { FeeEntity } from "@/entities/fee.entity";
import type { FeeDocument } from "@/documents/FeeDocument";
import type { CreateFeeDTO, UpdateFeeDTO } from "@/dto";
import type { PaginatedResult } from "@/types/api";
import { FeePersistenceMapper } from "@/lib/mappers/FeePersistenceMapper";

export class FeesService implements IFeesService {
  private audit: AuditService;
  private validation: ValidationService;
  private repository: IFeesRepository;

  constructor(repository?: IFeesRepository) {
    this.repository = repository ?? new FeesRepository();
    this.audit = new AuditService();
    this.validation = new ValidationService();
  }

  async createFee(data: CreateFeeDTO, tenantId: string, userId?: string): Promise<FeeEntity> {
    const parsed = this.validation.validateOrThrow(CreateFeeSchema, data);

    const entity = FeePersistenceMapper.fromDTO(parsed);
    const document = FeePersistenceMapper.toFirestore(entity, userId || "");
    document.tenantId = tenantId;

    const savedDoc = await this.repository.save(document, tenantId);
    const id = savedDoc.id || "";

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

    await eventBus.publish(EVENTS.FEE_COLLECTED, {
      tenantId,
      feeId: id,
      studentId: parsed.studentId,
      amount: parsed.amountPaid,
      month: parsed.feeMonth,
      collectedBy: userId,
    });

    const created = await this.repository.findById(id, tenantId);
    if (!created) throw new Error("Fee record created but could not be retrieved");
    return FeePersistenceMapper.fromFirestore(created);
  }

  async getFeeById(tenantId: string, id: string): Promise<FeeEntity | null> {
    const doc = await this.repository.findById(id, tenantId);
    if (!doc) return null;
    return FeePersistenceMapper.fromFirestore(doc);
  }

  async listFees(tenantId: string, studentId?: string, page = 1, limit = 20): Promise<PaginatedResult<FeeEntity>> {
    let fees: FeeDocument[];
    
    if (studentId) {
      fees = await (this.repository as FeesRepository).findByStudent(tenantId, studentId, page * limit);
    } else {
      fees = await this.repository.findAll(tenantId);
    }

    fees.sort((a, b) => {
      const dateA = a.metadata?.createdAt ? new Date(a.metadata.createdAt).getTime() : 0;
      const dateB = b.metadata?.createdAt ? new Date(b.metadata.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedFees = fees.slice(start, end);

    return {
      data: paginatedFees.map(doc => FeePersistenceMapper.fromFirestore(doc)),
      total: fees.length,
      page,
      totalPages: Math.ceil(fees.length / limit) || 1,
    };
  }

  async updateFee(tenantId: string, id: string, data: UpdateFeeDTO, userId?: string): Promise<FeeEntity> {
    const existing = await this.repository.findById(id, tenantId);
    if (!existing) throw new Error("Fee record not found");

    const entity = FeePersistenceMapper.fromDTO(data);
    const document = FeePersistenceMapper.toFirestore(entity, userId || "");
    const updatePayload: Record<string, unknown> = { ...document, updatedBy: userId || "system", updatedAt: new Date() };
    Object.keys(updatePayload).forEach(key => {
      if (updatePayload[key as keyof typeof updatePayload] === undefined) {
        delete updatePayload[key as keyof typeof updatePayload];
      }
    });

    await this.repository.update(id, updatePayload, tenantId);
    const updated = await this.repository.findById(id, tenantId);
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
        metadata: { updates: data },
      });
    }

    await eventBus.publish(EVENTS.FEE_UPDATED, {
      tenantId,
      feeId: id,
      updates: data,
      updatedBy: userId,
    });

    return FeePersistenceMapper.fromFirestore(updated);
  }

  async deleteFee(tenantId: string, id: string, userId?: string): Promise<void> {
    const fee = await this.repository.findById(id, tenantId);
    await this.repository.delete(id, tenantId);

    await invalidateCache(`dashboard:${tenantId}`);
    await invalidateCache(`fees:${tenantId}`);

    if (userId) {
      await this.audit.log({
        action: "fee.deleted",
        userId,
        tenantId,
        entityId: id,
        entityType: "fee",
        metadata: { studentName: fee?.studentName, amount: fee?.amountPaid },
      });
    }

    await eventBus.publish(EVENTS.FEE_DELETED, {
      tenantId,
      feeId: id,
      studentId: fee?.studentId || "",
      deletedBy: userId,
    });
  }

  async getTotalRevenue(tenantId: string): Promise<number> {
    return (this.repository as FeesRepository).getTotalRevenue(tenantId);
  }

  async getRecentPayments(tenantId: string, limit = 5): Promise<FeeEntity[]> {
    const fees = await (this.repository as FeesRepository).getRecentPayments(tenantId, limit);
    return fees.map(doc => FeePersistenceMapper.fromFirestore(doc));
  }
}
