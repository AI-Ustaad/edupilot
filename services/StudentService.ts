// services/StudentService.ts
import { CreateStudentSchema } from "@/dto/CreateStudentDTO";
import type { CreateStudentDTO, UpdateStudentDTO } from "@/dto";
import { StudentPersistenceMapper } from "@/lib/mappers/StudentPersistenceMapper";
import { BusinessError } from "@/errors";
import { StudentRepository } from "@/repositories/student.repository";
import { AttendanceRepository } from "@/repositories/attendance.repository";
import { FeesRepository } from "@/repositories/fees.repository";
import { MarksRepository } from "@/repositories/marks.repository";
import { BehaviorRepository } from "@/repositories/behavior.repository";
import type { IStudentRepository } from "@/interfaces/IStudentRepository";
import type { IStudentService } from "@/interfaces/IStudentService";
import type { StudentEntity, Student360Aggregate, StudentComment, TimelineEntry } from "@/entities/student.entity";
import type { StudentAnalytics } from "@/types/student";
import type { PaginatedResult } from "@/types/api";
import { randomUUID } from "crypto";
import { nowISO } from "@/lib/date";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";

type Student360DataSources = {
  attendance: Pick<AttendanceRepository, "findByStudentId">;
  fees: Pick<FeesRepository, "findByStudent">;
  marks: Pick<MarksRepository, "findByStudent">;
  behavior: Pick<BehaviorRepository, "findByStudent">;
};

export class StudentService implements IStudentService {
  private repository: IStudentRepository;
  private readonly student360Sources: Student360DataSources;

  constructor(repository?: IStudentRepository, student360Sources?: Student360DataSources) {
    this.repository = repository ?? new StudentRepository();
    this.student360Sources = student360Sources ?? {
      attendance: new AttendanceRepository(),
      fees: new FeesRepository(),
      marks: new MarksRepository(),
      behavior: new BehaviorRepository(),
    };
  }

  async create(data: CreateStudentDTO, tenantId: string, userId: string): Promise<StudentEntity> {
    const validatedDTO = CreateStudentSchema.parse(data);
    const entity = StudentPersistenceMapper.fromDTO(validatedDTO);
    const document = StudentPersistenceMapper.toFirestore(entity, userId);

    if (document.rollNumber) {
      const rollNum = typeof document.rollNumber === "string" ? document.rollNumber : String(document.rollNumber);
      const existing = await this.repository.findByRollNumber(rollNum, tenantId);
      if (existing) {
        throw new BusinessError(`Student with roll number ${rollNum} already exists`);
      }
    }

    const savedDoc = await this.repository.save({
      ...document,
      tenantId,
    }, tenantId);
    
    const createdEntity = StudentPersistenceMapper.fromFirestore(savedDoc);

    eventBus.publish(EVENTS.STUDENT_CREATED, {
      tenantId,
      studentId: createdEntity.studentId || savedDoc.id,
      studentData: {
        firstName: document.firstName,
        lastName: document.lastName,
        fullName: document.fullName,
        classGrade: document.classGrade,
        section: document.section,
      },
    }, tenantId);

    return createdEntity;
  }

  async update(tenantId: string, studentId: string, data: UpdateStudentDTO, userId: string): Promise<StudentEntity | null> {
    const existing = await this.repository.findById(studentId, tenantId);
    if (!existing) return null;

    // Update DTOs are partial. Mapping them directly fills omitted nested
    // fields with create-time defaults, which silently overwrites persisted
    // student data. Merge at the domain boundary before writing the document.
    const current = StudentPersistenceMapper.fromFirestore(existing);
    const merged = {
      identity: { ...current.identity, ...data.identity },
      personal: { ...current.personal, ...data.personal },
      academic: { ...current.academic, ...data.academic },
      parentReferences: { ...current.parentReferences, ...data.parentReferences },
      contacts: { ...current.contacts, ...data.contacts },
      guardian: { ...current.guardian, ...data.guardian },
      medical: { ...current.medical, ...data.medical },
      demographics: { ...current.demographics, ...data.demographics },
      status: data.status ?? current.status,
      metadata: { ...current.metadata, ...data.metadata },
    };
    const entity = StudentPersistenceMapper.fromDTO(merged);
    const document = StudentPersistenceMapper.toFirestore(entity, userId);
    document.metadata = {
      ...existing.metadata,
      ...document.metadata,
      createdAt: existing.metadata?.createdAt,
    };
    
    const updatePayload: Record<string, unknown> = { ...document, updatedBy: userId, updatedAt: new Date() };
    Object.keys(updatePayload).forEach(key => {
      if (updatePayload[key as keyof typeof updatePayload] === undefined) {
        delete updatePayload[key as keyof typeof updatePayload];
      }
    });

    await this.repository.update(studentId, updatePayload as Parameters<IStudentRepository["update"]>[1], tenantId);
    const updated = await this.getById(tenantId, studentId);

    eventBus.publish(EVENTS.STUDENT_UPDATED, {
      tenantId,
      studentId,
      updates: updatePayload,
    }, tenantId);

    return updated;
  }

  async getById(tenantId: string, studentId: string): Promise<StudentEntity | null> {
    const doc = await this.repository.findById(studentId, tenantId);
    if (!doc) return null;
    return StudentPersistenceMapper.fromFirestore(doc);
  }

  async paginate(tenantId: string, page: number, limit: number): Promise<PaginatedResult<StudentEntity>> {
    const result = await this.repository.paginate(tenantId, page, limit);
    return {
      ...result,
      data: result.data.map(doc => StudentPersistenceMapper.fromFirestore(doc))
    };
  }

  async delete(tenantId: string, studentId: string, userId?: string): Promise<void> {
    await this.repository.softDelete(studentId, tenantId);

    eventBus.publish(EVENTS.STUDENT_DELETED, {
      tenantId,
      studentId,
      studentData: { studentId },
    }, tenantId);
  }

  async hardDelete(tenantId: string, studentId: string, userId: string): Promise<void> {
    await this.repository.delete(studentId, tenantId);

    eventBus.publish(EVENTS.STUDENT_DELETED, {
      tenantId,
      studentId,
      studentData: { studentId },
    }, tenantId);
  }

  async approveAdmission(tenantId: string, studentId: string, userId: string): Promise<void> {
    await this.repository.update(studentId, {
      admissionStatus: "approved",
      updatedBy: userId,
      updatedAt: new Date()
    }, tenantId);
  }

  async rejectAdmission(tenantId: string, studentId: string, userId: string): Promise<void> {
    await this.repository.update(studentId, {
      admissionStatus: "rejected",
      updatedBy: userId,
      updatedAt: new Date()
    }, tenantId);
  }

  async student360(tenantId: string, studentId: string): Promise<Student360Aggregate | null> {
    const student = await this.getById(tenantId, studentId);
    if (!student) return null;

    const [attendanceRecords, feeRecords, marks, behaviorLogs, timeline] = await Promise.all([
      this.student360Sources.attendance.findByStudentId(tenantId, studentId),
      this.student360Sources.fees.findByStudent(tenantId, studentId),
      this.student360Sources.marks.findByStudent(tenantId, studentId),
      this.student360Sources.behavior.findByStudent(studentId, tenantId),
      this.getTimeline(tenantId, studentId),
    ]);

    const present = attendanceRecords.filter((record) => record.status === "Present" || record.status === "Late").length;
    const absent = attendanceRecords.filter((record) => record.status === "Absent").length;
    const late = attendanceRecords.filter((record) => record.status === "Late").length;
    const attendancePercentage = attendanceRecords.length > 0
      ? Math.round((present / attendanceRecords.length) * 100)
      : 0;

    const feeAmount = (fee: { amountPaid?: number }) => Number(fee.amountPaid) || 0;
    const totalDue = feeRecords.reduce((sum, fee) => sum + feeAmount(fee), 0);
    const totalPaid = feeRecords
      .filter((fee) => fee.status?.trim().toLowerCase() === "paid")
      .reduce((sum, fee) => sum + feeAmount(fee), 0);

    const markPercentages = marks.map((mark) => {
      const supplied = Number(mark.percentage);
      if (Number.isFinite(supplied)) return supplied;
      const total = Number(mark.totalMarks) || 0;
      return total > 0 ? ((Number(mark.marksObtained) || 0) / total) * 100 : 0;
    });
    const markAverage = markPercentages.length > 0
      ? Math.round(markPercentages.reduce((sum, percentage) => sum + percentage, 0) / markPercentages.length)
      : 0;

    return {
      student: {
        ...student,
        id: student.studentId || student.id!,
      },
      attendance: { present, absent, late, percentage: attendancePercentage },
      fees: { totalDue, totalPaid, outstanding: Math.max(0, totalDue - totalPaid), records: feeRecords },
      marks: { exams: marks, average: markAverage, trend: "stable" },
      behavior: { logs: behaviorLogs, incidents: behaviorLogs.filter((log) => Number(log.points) < 0).length },
      transport: null,
      hostel: null,
      timeline,
      aiSummary: "",
    };
  }

  async addComment(tenantId: string, studentId: string, comment: string, userId: string): Promise<void> {
    const student = await this.getById(tenantId, studentId);
    
    if (!student) {
      throw new BusinessError(`Student with ID ${studentId} not found`);
    }

    const commentData: StudentComment = {
      id: randomUUID(),
      comment,
      commentedBy: userId,
      commentedAt: nowISO(),
      type: 'comment'
    };

    const existingComments = student.comments || [];
    
    await this.repository.update(studentId, {
      comments: [...existingComments, commentData],
      updatedBy: userId,
      updatedAt: new Date()
    }, tenantId);
  }

  async promote(tenantId: string, studentIds: string[], newClass: string, newSection: string, academicYear: string, userId: string) {
    return { success: true, promoted: studentIds.length, errors: [] as string[] };
  }

  async archive(tenantId: string, studentId: string, userId: string): Promise<void> {
    await this.repository.update(studentId, { status: "archived", updatedBy: userId }, tenantId);
  }

  async restore(tenantId: string, studentId: string, userId: string): Promise<void> {
    await this.repository.restore(studentId, tenantId);
  }

  async getTimeline(tenantId: string, studentId: string): Promise<TimelineEntry[]> {
    return this.repository.timeline(tenantId, studentId);
  }

  async bulkImport(tenantId: string, data: unknown[], userId: string): Promise<{ success: boolean; imported: number }> {
    return { success: true, imported: data.length };
  }

  async bulkCreate(tenantId: string, students: unknown[], userId: string) {
    const results: any[] = [];
    for (const studentData of students) {
      try {
        const created = await this.create(studentData as CreateStudentDTO, tenantId, userId);
        results.push({ success: true, id: created.studentId });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        results.push({ success: false, error: message });
      }
    }
    return { 
      success: true, 
      created: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results 
    };
  }

  async analytics(tenantId: string): Promise<StudentAnalytics> {
    return this.getAnalytics(tenantId);
  }

  async count(tenantId: string): Promise<number> {
    return this.repository.count(tenantId);
  }

  async countByClass(tenantId: string): Promise<Record<string, number>> {
    return this.repository.countByClass(tenantId);
  }

  async getAnalytics(tenantId: string): Promise<StudentAnalytics> {
    return this.repository.studentAnalytics(tenantId);
  }

  async getRiskData(tenantId: string): Promise<any[]> {
    const docs = await this.repository.findAll(tenantId);
    const risky = docs.filter(doc => {
      const status = doc.status || (doc.deleted ? "archived" : "active");
      return ["suspended", "dropped", "archived"].includes(status) || doc.deleted;
    });
    return risky.map(doc => StudentPersistenceMapper.fromFirestore(doc));
  }
}
