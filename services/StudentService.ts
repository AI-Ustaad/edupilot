// services/StudentService.ts
import { CreateStudentSchema } from "@/dto/CreateStudentDTO";
import type { CreateStudentDTO, UpdateStudentDTO } from "@/dto";
import { StudentPersistenceMapper } from "@/lib/mappers/StudentPersistenceMapper";
import { BusinessError } from "@/errors";
import { StudentRepository } from "@/repositories/student.repository";
import type { IStudentRepository } from "@/interfaces/IStudentRepository";
import type { IStudentService } from "@/interfaces/IStudentService";
import type { StudentEntity, Student360Aggregate, StudentComment, TimelineEntry } from "@/entities/student.entity";
import type { StudentAnalytics } from "@/types/student";
import type { PaginatedResult } from "@/types/api";
import { randomUUID } from "crypto";
import { nowISO } from "@/lib/date";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";

export class StudentService implements IStudentService {
  private repository: IStudentRepository;

  constructor(repository?: IStudentRepository) {
    this.repository = repository ?? new StudentRepository();
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
    const entity = StudentPersistenceMapper.fromDTO(data);
    const document = StudentPersistenceMapper.toFirestore(entity, userId);
    
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

    return {
      student: {
        ...student,
        id: student.studentId || student.id!,
      },
      attendance: { present: 0, absent: 0, late: 0, percentage: 0 },
      fees: { totalDue: 0, totalPaid: 0, outstanding: 0, records: [] },
      marks: { exams: [], average: 0, trend: "stable" },
      behavior: { logs: [], incidents: 0 },
      transport: null,
      hostel: null,
      timeline: [],
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
