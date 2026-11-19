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
import { formatClassLabel, cleanSectionName } from "@/lib/utils/formatClassLabel";
import { computeFeeSummary } from "@/lib/aggregations/shared-metrics";

import { adminDb } from "@/lib/firebase-admin";

export function normalizeBillingMonth(raw?: string): {
  monthName: string;
  year: string;
  key: string;
  label: string;
  monthNum: string;
} {
  const str = (raw || "November 2026").toString().trim();
  const parts = str.split(/\s+/);
  let monthName = parts[0] || "November";
  monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1).toLowerCase();
  const year = parts[1] || "2026";
  const monthsMap: Record<string, string> = {
    january: "01", february: "02", march: "03", april: "04", may: "05", june: "06",
    july: "07", august: "08", september: "09", october: "10", november: "11", december: "12"
  };
  const monthNum = monthsMap[monthName.toLowerCase()] || "11";
  const key = `${monthName.slice(0, 3).toLowerCase()}_${year}`;
  const label = `${monthName} ${year}`;
  return { monthName, year, key, label, monthNum };
}

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
      const currentNorm = normalizeBillingMonth("November 2026");

      for (const d of docs) {
        const data = d.data();
        const studentId = data.studentId || "";
        const m = (data.feeMonth || data.month || "November 2026").toString().trim();
        const norm = normalizeBillingMonth(m);
        const key = `${studentId}_${norm.key}`;
        if (!byStudentMonth.has(key)) {
          byStudentMonth.set(key, []);
        }
        byStudentMonth.get(key)!.push({ ref: d.ref, id: d.id, data, norm });

        // Ensure section & class accurately match student roster
        const student = studentMap.get(studentId);
        if (student) {
          const targetSec = cleanSectionName(student.section || "A");
          const targetClass = formatClassLabel(student.classGrade || "Class 10");
          if (data.section !== targetSec || data.classGrade !== targetClass) {
            await d.ref.update({
              section: targetSec,
              classGrade: targetClass,
              updatedAt: new Date().toISOString(),
            }).catch(() => {});
          }
        }
      }

      // 1. Reconcile existing records (deduplicate & heal amount <= 0)
      for (const [, records] of byStudentMonth.entries()) {
        const paidRecord = records.find(r => (r.data.status || "").toLowerCase() === "paid");
        if (paidRecord) {
          // Keep only the paid record, delete duplicate unpaid or extra records
          for (const rec of records) {
            if (rec.id !== paidRecord.id) {
              await rec.ref.delete().catch(() => {});
            }
          }
          // Preserve and ensure paidRecord amount is valid
          const currentPaid = Number(paidRecord.data.amountPaid || 0);
          const currentAssessed = Number(paidRecord.data.amount || 5000);
          const effectivePaid = currentPaid > 0 ? currentPaid : (currentAssessed > 0 ? currentAssessed : 5000);
          if (currentPaid <= 0 || currentAssessed <= 0) {
            await paidRecord.ref.update({
              amount: currentAssessed > 0 ? currentAssessed : 5000,
              amountPaid: effectivePaid,
              amountDue: 0,
              status: "paid",
              updatedAt: new Date().toISOString(),
            }).catch(() => {});
          }
        } else {
          // If multiple unpaid records exist, keep only the canonical deterministic one and delete duplicates
          const canonicalDocId = records[0].data.studentId
            ? `fee_${records[0].data.studentId}_${currentNorm.key.replace("_", "")}`
            : "";
          const primaryRec = records.find(r => r.id === canonicalDocId) || records[0];
          for (const rec of records) {
            if (rec.id !== primaryRec.id) {
              await rec.ref.delete().catch(() => {});
            }
          }
          // Ensure amount is 5000
          const currentAmount = Number(primaryRec.data.amount || primaryRec.data.amountDue || 0);
          if (currentAmount <= 0) {
            await primaryRec.ref.update({
              amount: 5000,
              amountDue: 5000,
              amountPaid: 0,
              status: "Pending",
              updatedAt: new Date().toISOString(),
            }).catch(() => {});
          }
        }
      }

      // 2. Auto-seed missing monthly fee records for active students (November 2026)
      for (const student of activeStudents) {
        const key = `${student.id}_${currentNorm.key}`;
        const existingRecords = byStudentMonth.get(key) || [];
        if (existingRecords.length === 0) {
          const feeDocId = `fee_${student.id}_${currentNorm.key.replace("_", "")}`;
          const amount = Number(student.monthlyFee) || 5000;
          const newFeeDoc = {
            id: feeDocId,
            tenantId,
            studentId: student.id,
            studentName: student.fullName || student.name || "Student",
            rollNumber: student.rollNumber || "",
            classGrade: formatClassLabel(student.classGrade || student.className || "Class 10"),
            section: cleanSectionName(student.section || "A"),
            feeMonth: currentNorm.label,
            month: currentNorm.label,
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
    const normalized = normalizeBillingMonth(parsed.feeMonth);
    const effectiveMonth = normalized.label;
    parsed.feeMonth = effectiveMonth;

    const isPaid = (parsed.status || "paid").toLowerCase() === "paid";
    const amountPaid = isPaid ? (parsed.amountPaid ?? 5000) : 0;
    const amountAssessed = Number(parsed.amount) || Number(parsed.amountPaid) || 5000;
    const amountDue = isPaid ? 0 : amountAssessed;
    const receiptNumber = isPaid
      ? (parsed.receiptNumber || `RCP-${normalized.year}${normalized.monthNum}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`)
      : undefined;
    const paidAt = isPaid ? (parsed.paidAt || new Date().toISOString()) : undefined;

    const entity = FeePersistenceMapper.fromDTO({
      ...parsed,
      amount: amountAssessed,
      amountPaid,
      amountDue,
      receiptNumber,
      paidAt,
      status: isPaid ? "paid" : (parsed.status || "pending"),
    });

    const document = FeePersistenceMapper.toFirestore(entity, userId || "");
    document.tenantId = tenantId;
    document.feeMonth = effectiveMonth;

    const feeDocId = `fee_${parsed.studentId}_${normalized.key.replace("_", "")}`;
    document.id = feeDocId;

    // Prune any legacy or duplicate records for this student and month
    try {
      const db = (this.repository as any).db || adminDb;
      if (db?.collection && parsed.studentId) {
        const existingSnap = await db.collection("fees")
          .where("tenantId", "==", tenantId)
          .where("studentId", "==", parsed.studentId)
          .get();
        if (!existingSnap.empty) {
          for (const d of existingSnap.docs) {
            const m = (d.data().feeMonth || d.data().month || "").toLowerCase().trim();
            if (m.includes(normalized.monthName.toLowerCase().slice(0, 3))) {
              if (d.id !== feeDocId) {
                await d.ref.delete().catch(() => {});
              }
            }
          }
        }
      }
    } catch {
      // non-fatal
    }

    const savedDoc = await this.repository.save(document, tenantId);
    const id = savedDoc.id || feeDocId;

    await invalidateCache(`dashboard:${tenantId}`);
    await invalidateCache(`fees:${tenantId}`);

    if (userId) {
      await this.audit.log({
        action: "fee.created",
        userId,
        tenantId,
        entityId: id,
        entityType: "fee",
        metadata: { studentId: parsed.studentId, amount: amountPaid, month: effectiveMonth },
      });
    }

    await eventBus.publish(EVENTS.FEE_COLLECTED, {
      tenantId,
      feeId: id,
      studentId: parsed.studentId,
      amount: amountPaid,
      month: effectiveMonth,
      collectedBy: userId,
    }, tenantId);

    if (amountPaid > 0) {
      try {
        await this.ledgerService.createEntry({
          type: "income",
          description: `Fee collected for ${parsed.studentName || parsed.studentId} (${effectiveMonth})`,
          amount: amountPaid,
          tenantId,
          createdBy: userId || "system",
        }, tenantId);
      } catch (err) {
        console.warn("[FeesService] Failed to record income ledger entry on fee collection:", err);
      }
    }

    const created = await this.repository.findById(id, tenantId);
    if (!created) return FeePersistenceMapper.fromFirestore({ ...document, id, tenantId });
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
    limit = 100
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
      const targetMonth = filters.month.trim().toLowerCase();
      const monthPrefix = targetMonth.slice(0, 3);
      fees = fees.filter(f => {
        const m = (f.feeMonth || f.paymentDetails?.billingMonth || f.financial?.feeMonth || "").toString().trim().toLowerCase();
        return m === targetMonth || m.includes(monthPrefix) || targetMonth.includes(m.slice(0, 3));
      });
    }
    if (filters.classGrade) {
      const normTarget = formatClassLabel(filters.classGrade).toLowerCase();
      fees = fees.filter(f => {
        const cg = formatClassLabel(f.classGrade || f.studentInfo?.classId || f.financial?.classGrade || "").toLowerCase();
        return cg === normTarget;
      });
    }
    if (filters.section) {
      const normSec = cleanSectionName(filters.section).toLowerCase();
      fees = fees.filter(f => {
        const sec = cleanSectionName(f.section || f.studentInfo?.sectionId || f.financial?.section || "").toLowerCase();
        return sec === normSec;
      });
    }

    fees.sort((a, b) => {
      const rollA = Number(String(a.rollNumber || "").replace(/\D/g, "")) || 0;
      const rollB = Number(String(b.rollNumber || "").replace(/\D/g, "")) || 0;
      if (rollA !== rollB && rollA > 0 && rollB > 0) return rollA - rollB;
      const nameA = (a.studentName || "").toLowerCase();
      const nameB = (b.studentName || "").toLowerCase();
      return nameA.localeCompare(nameB);
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
