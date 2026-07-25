import type { CreateFeeDTO, UpdateFeeDTO } from "@/dto";
import type { FeeEntity } from "@/entities/fee.entity";
import type { FeeDocument } from "@/documents/FeeDocument";

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
        amountPaid: dto.amountPaid || 0,
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
    return {
      studentId: entity.identity?.studentId || "",
      studentName: entity.identity?.studentName,
      email: entity.identity?.email,
      rollNumber: entity.identity?.rollNumber,
      classGrade: entity.financial?.classGrade,
      feeMonth: entity.financial?.feeMonth || "",
      amountPaid: entity.financial?.amountPaid || 0,
      paymentMethod: entity.financial?.paymentMethod || "Cash",
      remarks: entity.financial?.remarks,
      dueDate: entity.financial?.dueDate,
      status: entity.financial?.status,
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
    return {
      feeId: doc.id || "",
      id: doc.id || "",
      identity: {
        studentId: doc.studentId || "",
        studentName: doc.studentName,
        rollNumber: doc.rollNumber,
        email: doc.email,
      },
      financial: {
        classGrade: doc.classGrade,
        feeMonth: doc.feeMonth || "",
        amountPaid: doc.amountPaid || 0,
        paymentMethod: doc.paymentMethod || "Cash",
        dueDate: doc.dueDate,
        status: doc.status,
        remarks: doc.remarks,
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
    };
  }
}
