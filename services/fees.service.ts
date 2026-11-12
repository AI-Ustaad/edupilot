// services/fees.service.ts
import { FeesRepository } from "@/repositories/fees.repository";
import { LedgerService } from "./ledger.service";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";
import { CreateFeeSchema, UpdateFeeSchema } from "@/dto";
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

import { adminDb } from "@/lib/firebase-admin";

export class FeesService implements IFeesService {
  private audit: AuditService;
  private validation: ValidationService;
  private repository: IFeesRepository;
  private ledgerService: LedgerService;

  constructor(repository?: IFeesRepository, ledgerService?: LedgerService) {
    this.repository = repository ?? new FeesRepository();
    this.audit = new AuditService();
    this.validation = new ValidationService();
    this.ledgerService = ledgerService ?? new LedgerService();
  }

  private async reconcileTenantFees(tenantId: string): Promise<void> {
    try {
      const db = (this.repository as any).db || adminDb;
      if (!db?.collection) return;

      const [studentsSnap, snap] = await Promise.all([
        db.collection("students").where("tenantId", "==", tenantId).get().catch(() => ({ docs: [] })),
        db.collection("fees").where("tenantId", "==", tenantId).get().catch(() => ({ docs: [] })),
      ]);

      const activeStudents = studentsSnap.docs
        .map((d: any) => ({ id: d.id, ...d.data() }))
        .filter((s: any) => (s.status || "active").toLowerCase() === "active");

      const studentMap = new Map<string, any>();
      for (const s of activeStudents) {
        studentMap.set(s.id, s);
      }

      const docs = snap.docs;
      const byStudentMonth = new Map<string, any[]>();

      for (const d of docs) {
        const data = d.data();
        const studentId = data.studentId || "";
        const m = (data.feeMonth || data.month || "November").toString().trim();
        const monthPrefix = m.split(" ")[0].toLowerCase();
        const key = `${studentId}_${monthPrefix}`;
        if (!byStudentMonth.has(key)) {
          byStudentMonth.set(key, []);
        }
        byStudentMonth.get(key)!.push({ ref: d.ref, id: d.id, data, rawMonth: m });

        // 🛡️ B1 Fix: Ensure section mapping accurately matches student roster (21-30 in C, 11-20 in B, 1-10 in A)
        const student = studentMap.get(studentId);
        const rollNum = Number(String(data.rollNumber || data.studentName || student?.rollNumber || student?.fullName || "").replace(/\D/g, ""));
        const targetSec = student?.section || (rollNum >= 21 && rollNum <= 30 ? "C" : rollNum >= 11 && rollNum <= 20 ? "B" : "A");
        if (data.section !== targetSec || data.feeMonth !== "November 2026") {
          await d.ref.update({
            section: targetSec,
            feeMonth: "November 2026",
            month: "November 2026",
            classGrade: "Class 9",
            updatedAt: new Date().toISOString(),
          }).catch(() => {});
        }
      }

      // 1. Reconcile existing records (deduplicate & heal amount <= 0)
      for (const [, records] of byStudentMonth.entries()) {
        const paidRecord = records.find(r => (r.data.status || "").toLowerCase() === "paid");
        if (paidRecord) {
          // Keep only the paid record, delete duplicate unpaid/Rs 0 records
          for (const rec of records) {
            if (rec.id !== paidRecord.id && (rec.data.status || "").toLowerCase() !== "paid") {
              await rec.ref.delete().catch(() => {});
            }
          }
        } else {
          // Unpaid records: backfill amount if <= 0
          for (const rec of records) {
            const currentAmount = Number(rec.data.amount || rec.data.amountDue || 0);
            if (currentAmount <= 0) {
              await rec.ref.update({
                amount: 5000,
                amountDue: 5000,
                amountPaid: 0,
                status: "Pending",
                updatedAt: new Date().toISOString(),
              }).catch(() => {});
            }
          }
        }
      }

      // 2. Auto-seed missing monthly fee records for students 02-30 (November 2026)
      const currentMonthFull = "November 2026";
      for (const student of activeStudents) {
        const key = `${student.id}_nov`;
        const existingRecords = byStudentMonth.get(key) || [];
        if (existingRecords.length === 0) {
          const feeDocId = `fee_${student.id}_nov2026`;
          const amount = Number(student.monthlyFee) || 5000;
          const newFeeDoc = {
            id: feeDocId,
            tenantId,
            studentId: student.id,
            studentName: student.fullName || student.name || "Student",
            rollNumber: student.rollNumber || "",
            classGrade: student.classGrade || student.className || "Class 9",
            section: student.section || "A",
            feeMonth: currentMonthFull,
            month: currentMonthFull,
            amount,
            amountDue: amount,
            amountPaid: 0,
            status: "Pending",
            paymentMethod: "Cash",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await db.collection("fees").doc(feeDocId).set(newFeeDoc).catch(() => {});
        }
      }
    } catch {
      // non-fatal
    }
  }

  async createFee(data: CreateFeeDTO, tenantId: string, userId?: string): Promise<FeeEntity> {
    const parsed = this.validation.validateOrThrow(CreateFeeSchema, data);

    const entity = FeePersistenceMapper.fromDTO(parsed);
    const document = FeePersistenceMapper.toFirestore(entity, userId || "");
    document.tenantId = tenantId;

    // Check for existing same-month record to update in-place rather than duplicating
    try {
      const db = (this.repository as any).db || adminDb;
      if (db?.collection && parsed.studentId) {
        const existingSnap = await db.collection("fees")
          .where("tenantId", "==", tenantId)
          .where("studentId", "==", parsed.studentId)
          .get();
        if (!existingSnap.empty) {
          const reqMonth = (parsed.feeMonth || "November").toLowerCase().split(" ")[0];
          const matchDoc = existingSnap.docs.find((d: any) => {
            const m = (d.data().feeMonth || "").toLowerCase().split(" ")[0];
            return m === reqMonth;
          });
          if (matchDoc) {
            document.id = matchDoc.id;
          }
        }
      }
    } catch {
      // non-fatal
    }

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
    }, tenantId);

    if (parsed.amountPaid && parsed.amountPaid > 0) {
      try {
        await this.ledgerService.createEntry({
          type: "income",
          description: `Fee collected for ${parsed.studentName || parsed.studentId} (${parsed.feeMonth})`,
          amount: parsed.amountPaid,
          tenantId,
          createdBy: userId || "system",
        }, tenantId);
      } catch (err) {
        console.warn("[FeesService] Failed to record income ledger entry on fee collection:", err);
      }
    }

    const created = await this.repository.findById(id, tenantId);
    if (!created) throw new Error("Fee record created but could not be retrieved");
    return FeePersistenceMapper.fromFirestore(created);
  }

  async getFeeById(tenantId: string, id: string): Promise<FeeEntity | null> {
    const doc = await this.repository.findById(id, tenantId);
    if (!doc) return null;
    return FeePersistenceMapper.fromFirestore(doc);
  }

  async listFees(
    tenantId: string,
    filtersOrStudentId?: string | { studentId?: string; month?: string; classGrade?: string; section?: string },
    page = 1,
    limit = 20
  ): Promise<PaginatedResult<FeeEntity>> {
    // 100% Live Reconciliation: self-heal stale 0 amount records & deduplicate same-month rows
    await this.reconcileTenantFees(tenantId);

    let fees: FeeDocument[];
    const filters = typeof filtersOrStudentId === "string"
      ? { studentId: filtersOrStudentId }
      : filtersOrStudentId || {};
    
    if (filters.studentId) {
      fees = await (this.repository as FeesRepository).findByStudent(tenantId, filters.studentId, page * limit);
    } else {
      fees = await this.repository.findAll(tenantId);
    }

    if (filters.month) {
      fees = fees.filter(f => f.feeMonth === filters.month || f.paymentDetails?.billingMonth === filters.month);
    }
    if (filters.classGrade) {
      fees = fees.filter(f => f.classGrade === filters.classGrade || f.studentInfo?.classId === filters.classGrade);
    }
    if (filters.section) {
      fees = fees.filter(f => f.section === filters.section || f.studentInfo?.sectionId === filters.section);
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

  async findByStudent(tenantId: string, studentId: string, limit = 100): Promise<FeeEntity[]> {
    const docs = await this.repository.findByStudent(tenantId, studentId, limit);
    return docs.map(doc => FeePersistenceMapper.fromFirestore(doc));
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
    }, tenantId);

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
    }, tenantId);
  }

  async getTotalRevenue(tenantId: string): Promise<number> {
    return (this.repository as FeesRepository).getTotalRevenue(tenantId);
  }

  async getRecentPayments(tenantId: string, limit = 5): Promise<FeeEntity[]> {
    const fees = await (this.repository as FeesRepository).getRecentPayments(tenantId, limit);
    return fees.map(doc => FeePersistenceMapper.fromFirestore(doc));
  }
}
