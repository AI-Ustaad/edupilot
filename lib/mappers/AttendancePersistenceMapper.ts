import type { CreateAttendanceDTO, UpdateAttendanceDTO } from "@/dto";
import type { AttendanceEntity } from "@/entities/attendance.entity";
import type { AttendanceDocument } from "@/documents/AttendanceDocument";

export class AttendancePersistenceMapper {
  static fromDTO(dto: Partial<CreateAttendanceDTO>): Partial<AttendanceEntity> {
    return {
      studentId: dto.studentId || "",
      studentName: dto.studentName,
      rollNumber: dto.rollNumber,
      classGrade: dto.classGrade || "",
      section: dto.section || "",
      date: dto.date || "",
      status: dto.status || "Present",
      period: dto.period,
      remarks: dto.remarks,
      lateMinutes: dto.lateMinutes,
      approvedBy: dto.approvedBy,
      leaveRequestId: dto.leaveRequestId,
      metadata: {
        version: dto.metadata?.version || 1,
        source: dto.metadata?.source,
      },
    };
  }

  static toFirestore(entity: Partial<AttendanceEntity>, userId: string): AttendanceDocument {
    const doc: AttendanceDocument = {
      studentId: entity.studentId || "",
      studentName: entity.studentName,
      rollNumber: entity.rollNumber,
      classGrade: entity.classGrade || "",
      section: entity.section || "",
      date: entity.date || "",
      status: entity.status || "Present",
      period: entity.period,
      remarks: entity.remarks,
      lateMinutes: entity.lateMinutes,
      approvedBy: entity.approvedBy,
      leaveRequestId: entity.leaveRequestId,
      metadata: {
        version: entity.metadata?.version || 1,
        source: entity.metadata?.source,
        createdBy: userId,
        updatedBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
    return doc;
  }

  static fromFirestore(doc: AttendanceDocument): AttendanceEntity {
    return {
      attendanceId: doc.id || "",
      id: doc.id || "",
      studentId: doc.studentId || "",
      studentName: doc.studentName,
      rollNumber: doc.rollNumber,
      classGrade: doc.classGrade || "",
      section: doc.section || "",
      date: doc.date || "",
      status: doc.status as AttendanceEntity["status"] || "Present",
      period: doc.period,
      remarks: doc.remarks,
      lateMinutes: doc.lateMinutes,
      approvedBy: doc.approvedBy,
      leaveRequestId: doc.leaveRequestId,
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
