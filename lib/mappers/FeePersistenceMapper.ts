import type { CreateFeeDTO, UpdateFeeDTO } from "@/dto";
import type { FeeEntity } from "@/entities/fee.entity";
import type { FeeDocument } from "@/documents/FeeDocument";

function isFiniteNumber(val: unknown): val is number {
  return typeof val === "number" && Number.isFinite(val);
}

export class FeePersistenceMapper {
  static fromDTO(dto: Partial<CreateFeeDTO>): Partial<FeeEntity> {
    return {
      identity: {
        studentId: dto.studentId || "",
        studentName: dto.studentName,
        rollNumber: dto.rollNumber,
        email: dto.email || undefined,
      },
      financial: {
        classGrade: dto.classGrade,
        feeMonth: dto.feeMonth || "",
        amountPaid: isFiniteNumber(dto.amountPaid) ? dto.amountPaid : 0,
        paymentMethod: dto.paymentMethod || "Cash",
        dueDate: dto.dueDate,
        status: dto.status,
        remarks: dto.remarks,
      },
      metadata: {
        version: dto.metadata?.version || 1,
        source: dto.metadata?.source,
      },
    };
  }

  static toFirestore(entity: Partial<FeeEntity>, userId: string): FeeDocument {
    const collected = isFiniteNumber(entity.financial?.amountPaid)
      ? Math.max(0, entity.financial.amountPaid)
      : isFiniteNumber(entity.amountPaid)
      ? Math.max(0, entity.amountPaid)
      : 0;

    const assessed = isFiniteNumber(entity.amount)
      ? Math.max(0, entity.amount)
      : collected;

    const outstanding = isFiniteNumber(entity.amountDue)
      ? Math.max(0, entity.amountDue)
      : Math.max(0, assessed - collected);

    return {
      studentId: entity.identity?.studentId || entity.studentId || "",
      studentName: entity.identity?.studentName || entity.studentName,
      email: entity.identity?.email || entity.email,
      rollNumber: entity.identity?.rollNumber ?? entity.rollNumber,
      classGrade: entity.financial?.classGrade || entity.classGrade,
      feeMonth: entity.financial?.feeMonth || entity.feeMonth || "",
      amountPaid: collected,
      amount: assessed,
      amountDue: outstanding,
      paymentMethod: entity.financial?.paymentMethod || entity.paymentMethod || "Cash",
      remarks: entity.financial?.remarks || entity.remarks,
      dueDate: entity.financial?.dueDate || entity.dueDate,
      status: entity.financial?.status || entity.status,
      metadata: {
        version: entity.metadata?.version || 1,
        source: entity.metadata?.source,
        createdBy: userId,
        updatedBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  }

  static fromFirestore(doc: FeeDocument): FeeEntity {
    // 1. Resolve Collected (amountPaid): actual verified cash received (never infer from status or assessed fee)
    const collected = isFiniteNumber(doc.amountPaid)
      ? Math.max(0, doc.amountPaid)
      : isFiniteNumber(doc.paymentDetails?.paidAmount)
      ? Math.max(0, doc.paymentDetails.paidAmount)
      : isFiniteNumber(doc.financial?.amountPaid)
      ? Math.max(0, doc.financial.amountPaid)
      : 0;

    // 2. Resolve Assessed (amount): original fee obligation
    const assessed = isFiniteNumber(doc.amount)
      ? Math.max(0, doc.amount)
      : isFiniteNumber(doc.paymentDetails?.amount)
      ? Math.max(0, doc.paymentDetails.amount)
      : (isFiniteNumber(doc.amountDue) ? Math.max(0, doc.amountDue) + collected : collected);

    // 3. Resolve Outstanding Balance (amountDue): amount still owed
    let outstanding: number;
    if (isFiniteNumber(doc.amountDue)) {
      outstanding = Math.max(0, doc.amountDue);
    } else if (isFiniteNumber(doc.paymentDetails?.remainingAmount)) {
      outstanding = Math.max(0, doc.paymentDetails.remainingAmount);
    } else if (isFiniteNumber(doc.amount) || isFiniteNumber(doc.paymentDetails?.amount)) {
      outstanding = Math.max(0, assessed - collected);
    } else {
      outstanding = 0;
    }

    // 4. Resolve Canonical Status (paid, partial, pending)
    let status = (doc.status || doc.paymentDetails?.status || doc.financial?.status || "").toLowerCase().trim();
    if (!status) {
      if (outstanding === 0 && collected > 0) {
        status = "paid";
      } else if (collected > 0 && outstanding > 0) {
        status = "partial";
      } else {
        status = "pending";
      }
    }

    const feeMonth = doc.feeMonth || doc.paymentDetails?.billingMonth || doc.financial?.feeMonth || "";
    const paymentMethod = doc.paymentMethod || doc.paymentDetails?.paymentMethod || doc.financial?.paymentMethod || "Cash";
    const studentId = doc.studentId || doc.identity?.studentId || "";
    const studentName = doc.studentName || doc.identity?.studentName || "";
    const rollNumber = doc.rollNumber ?? doc.identity?.rollNumber;
    const email = doc.email || doc.identity?.email;
    const classGrade = doc.classGrade || doc.financial?.classGrade;
    const dueDate = doc.dueDate || doc.financial?.dueDate;
    const remarks = doc.remarks || doc.financial?.remarks;

    return {
      feeId: doc.id || "",
      id: doc.id || "",
      identity: {
        studentId,
        studentName,
        rollNumber,
        email,
      },
      financial: {
        classGrade,
        feeMonth,
        amountPaid: collected,
        paymentMethod,
        dueDate,
        status,
        remarks,
      },
      metadata: {
        version: doc.metadata?.version ?? 1,
        source: doc.metadata?.source ?? "web",
        createdBy: doc.metadata?.createdBy,
        updatedBy: doc.metadata?.updatedBy,
        createdAt: doc.metadata?.createdAt,
        updatedAt: doc.metadata?.updatedAt,
      },
      tenantId: doc.tenantId,
      createdBy: doc.metadata?.createdBy,
      updatedBy: doc.metadata?.updatedBy,
      createdAt: doc.metadata?.createdAt,
      updatedAt: doc.metadata?.updatedAt,

      // Flat Compatibility Fields
      studentId,
      studentName,
      rollNumber,
      email,
      classGrade,
      feeMonth,
      amountPaid: collected,
      amountDue: outstanding,
      amount: assessed,
      paymentMethod,
      dueDate,
      status,
      remarks,
    };
  }
}
