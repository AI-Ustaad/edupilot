// services/StudentService.ts
import { IStudentRepository } from "@/interfaces/IStudentRepository";
import { StudentRepository } from "@/repositories/student.repository";
import { Student } from "@/types/student";
import { ValidationService } from "./ValidationService";
import { AuditService } from "./AuditService";
import { CreateStudentSchema, UpdateStudentSchema } from "@/validators/student";
import {
  NotFoundException,
  BusinessError,
  ValidationError,
} from "@/errors/AppError";
import { PaginatedResult } from "@/types/api";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";
import { invalidateCache } from "@/lib/cache";

export class StudentService {
  private repository: IStudentRepository;
  private validation: ValidationService;
  private audit: AuditService;

  constructor(repository?: IStudentRepository) {
    this.repository = repository ?? new StudentRepository();
    this.validation = new ValidationService();
    this.audit = new AuditService();
  }

  async list(tenantId: string): Promise<(Student & { id: string })[]> {
    return this.repository.findAll(tenantId);
  }

  async paginate(
    tenantId: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResult<Student & { id: string }>> {
    return this.repository.paginate(tenantId, page, limit);
  }

  async getById(tenantId: string, id: string): Promise<Student & { id: string }> {
    const student = await this.repository.findById(id, tenantId);
    if (!student) throw new NotFoundException("Student not found");
    return student;
  }

  async create(data: any, tenantId: string, userId: string): Promise<Student & { id: string }> {
    const validation = this.validation.validate(CreateStudentSchema, data);
    if (!validation.success) {
      throw new ValidationError("Validation failed", validation.errors);
    }

    // Check for duplicate roll number
    if (validation.data.rollNumber) {
      const existing = await this.repository.findByRollNumber(
        validation.data.rollNumber,
        tenantId
      );
      if (existing) {
        throw new BusinessError(
          `A student with roll number ${validation.data.rollNumber} already exists`
        );
      }
    }

    const docData = {
      ...validation.data,
      tenantId,
      createdBy: userId,
    };

    const id = await this.repository.create(docData, tenantId);
    const student = await this.repository.findById(id, tenantId);

    // Cache invalidation
    await invalidateCache(`dashboard:${tenantId}`);

    // Publish event
    eventBus.publish(EVENTS.STUDENT_CREATED, {
      tenantId,
      studentId: id,
      studentData: student,
    });

    // Audit log
    await this.audit.log({
      action: "student.created",
      userId,
      tenantId,
      entityId: id,
      entityType: "student",
      metadata: { fullName: validation.data.fullName },
    });

    return student!;
  }

  async update(tenantId: string, id: string, data: any, userId?: string): Promise<Student & { id: string }> {
    // Verify existence
    await this.getById(tenantId, id);

    const validation = this.validation.validate(UpdateStudentSchema, data);
    if (!validation.success) {
      throw new ValidationError("Validation failed", validation.errors);
    }

    const updateData = {
      ...validation.data,
      updatedBy: userId || "system",
    };

    await this.repository.update(id, updateData, tenantId);

    // Cache invalidation
    await invalidateCache(`dashboard:${tenantId}`);

    // Audit log
    await this.audit.log({
      action: "student.updated",
      userId: userId || "system",
      tenantId,
      entityId: id,
      entityType: "student",
      metadata: { updatedFields: Object.keys(data) },
    });

    const updated = await this.repository.findById(id, tenantId);
    return updated!;
  }

  async delete(tenantId: string, id: string, userId?: string): Promise<void> {
    const student = await this.getById(tenantId, id);
    await this.repository.softDelete(id, tenantId);

    // Cache invalidation
    await invalidateCache(`dashboard:${tenantId}`);

    // Audit log
    await this.audit.log({
      action: "student.deleted",
      userId: userId || "system",
      tenantId,
      entityId: id,
      entityType: "student",
      metadata: { fullName: student.fullName },
    });
  }

  async hardDelete(tenantId: string, id: string, userId?: string): Promise<void> {
    await this.getById(tenantId, id);
    await this.repository.delete(id, tenantId);

    await invalidateCache(`dashboard:${tenantId}`);

    await this.audit.log({
      action: "student.hard_deleted",
      userId: userId || "system",
      tenantId,
      entityId: id,
      entityType: "student",
    });
  }

  async count(tenantId: string): Promise<number> {
    return this.repository.count(tenantId);
  }

  async exists(id: string, tenantId: string): Promise<boolean> {
    return this.repository.exists(id, tenantId);
  }

  async search(tenantId: string, query: string): Promise<(Student & { id: string })[]> {
    return this.repository.search(tenantId, query);
  }

  async promote(
    tenantId: string,
    studentIds: string[],
    newClassGrade: string,
    newSection: string,
    academicYear: string,
    userId: string
  ): Promise<{ promoted: number; errors: string[] }> {
    const promoted: string[] = [];
    const errors: string[] = [];

    for (const studentId of studentIds) {
      try {
        const student = await this.getById(tenantId, studentId);
        const oldClass = student.classGrade;
        const oldSection = student.section;

        await this.repository.update(
          studentId,
          {
            classGrade: newClassGrade,
            section: newSection,
            academicYear,
            previousClass: oldClass,
            previousSection: oldSection,
            promotedAt: new Date(),
            promotedBy: userId,
            updatedBy: userId,
          },
          tenantId
        );

        promoted.push(studentId);
      } catch (err: any) {
        errors.push(`Student ${studentId}: ${err.message}`);
      }
    }

    if (promoted.length > 0) {
      await this.audit.log({
        action: "student.promote",
        userId,
        tenantId,
        entityType: "student",
        metadata: { count: promoted.length, newClassGrade, newSection, academicYear },
      });
    }

    return { promoted: promoted.length, errors };
  }

  async bulkCreate(
    dataArray: any[],
    tenantId: string,
    userId: string
  ): Promise<{ ids: string[]; count: number }> {
    const validatedData = dataArray.map((data) => {
      const validation = this.validation.validate(CreateStudentSchema, data);
      if (!validation.success) {
        throw new ValidationError("Bulk validation failed", validation.errors);
      }
      return { ...validation.data, createdBy: userId };
    });

    const ids = await this.repository.bulkCreate(validatedData, tenantId);

    await this.audit.log({
      action: "student.bulk_created",
      userId,
      tenantId,
      entityType: "student",
      metadata: { count: validatedData.length },
    });

    return { ids, count: validatedData.length };
  }

  async addComment(
    tenantId: string,
    id: string,
    comment: string,
    userId: string
  ): Promise<void> {
    await this.getById(tenantId, id);
    await this.repository.update(
      id,
      { teacherComment: comment, updatedBy: userId },
      tenantId
    );

    await this.audit.log({
      action: "student.comment_added",
      userId,
      tenantId,
      entityId: id,
      entityType: "student",
      metadata: { comment },
    });
  }

  async approveAdmission(
    tenantId: string,
    studentId: string,
    userId: string
  ): Promise<void> {
    const student = await this.getById(tenantId, studentId);
    await this.repository.update(
      studentId,
      { admissionStatus: "approved", updatedBy: userId },
      tenantId
    );

    await this.audit.log({
      action: "student.admission_approved",
      userId,
      tenantId,
      entityId: studentId,
      entityType: "student",
      metadata: { fullName: student.fullName },
    });
  }

  async rejectAdmission(
    tenantId: string,
    studentId: string,
    userId: string
  ): Promise<void> {
    const student = await this.getById(tenantId, studentId);
    await this.repository.update(
      studentId,
      { admissionStatus: "rejected", updatedBy: userId },
      tenantId
    );

    await this.audit.log({
      action: "student.admission_rejected",
      userId,
      tenantId,
      entityId: studentId,
      entityType: "student",
      metadata: { fullName: student.fullName },
    });
  }

  async getByClass(
    tenantId: string,
    className: string
  ): Promise<(Student & { id: string })[]> {
    return this.repository.findByClass(className, tenantId);
  }

  async getBySection(
    tenantId: string,
    className: string,
    section: string
  ): Promise<(Student & { id: string })[]> {
    return this.repository.findBySection(className, section, tenantId);
  }

  async countByClass(tenantId: string): Promise<Record<string, number>> {
    return this.repository.countByClass(tenantId);
  }
}
