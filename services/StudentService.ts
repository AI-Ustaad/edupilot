// services/StudentService.ts

import { CreateStudentSchema } from "@/validators/student";
import { StudentPersistenceMapper } from "@/lib/mappers/StudentPersistenceMapper";
import { BusinessError } from "@/errors";
import { StudentRepository } from "@/repositories/student.repository"; 
import type { StudentEntity, Student360Aggregate } from "@/entities/student.entity";

export class StudentService {
  private repository: StudentRepository;

  constructor() {
    this.repository = new StudentRepository(); 
  }

  /**
   * Create Student Use-Case (Enterprise Flow)
   */
  async create(data: any, tenantId: string, userId: string): Promise<StudentEntity> {
    const validatedAggregate = CreateStudentSchema.parse(data);
    const document = StudentPersistenceMapper.toFirestore(validatedAggregate, userId);

    if (document.rollNumber) {
      const existing = await this.repository.findByRollNumber(document.rollNumber, tenantId);
      if (existing) {
        throw new BusinessError(`Student with roll number ${document.rollNumber} already exists`);
      }
    }

    const savedDoc = await this.repository.save({
      ...document,
      tenantId,
    }, tenantId);
    
    return StudentPersistenceMapper.fromFirestore(savedDoc);
  }

  /**
   * Update Student
   */
  async update(studentId: string, data: any, tenantId: string, userId: string): Promise<StudentEntity | null> {
    await this.repository.update(studentId, {
      ...data,
      updatedBy: userId,
      updatedAt: new Date()
    }, tenantId);
    return this.getById(tenantId, studentId);
  }

  /**
   * Get Student By ID
   */
  async getById(tenantId: string, studentId: string): Promise<StudentEntity | null> {
    const doc = await this.repository.findById(studentId, tenantId);
    if (!doc) return null;
    return StudentPersistenceMapper.fromFirestore(doc);
  }

  /**
   * Paginate Students
   */
  async paginate(tenantId: string, page: number, limit: number) {
    const result = await this.repository.paginate(tenantId, page, limit);
    return {
      ...result,
      data: result.data.map(doc => StudentPersistenceMapper.fromFirestore(doc))
    };
  }

  /**
   * Delete Student (Soft Delete)
   */
  async delete(tenantId: string, studentId: string, userId?: string) {
    return await this.repository.softDelete(studentId, tenantId);
  }

  /**
   * Hard Delete Student (Permanent Delete)
   */
  async hardDelete(tenantId: string, studentId: string, userId: string) {
    return await this.repository.delete(studentId, tenantId);
  }

  /**
   * Approve Student Admission
   */
  async approveAdmission(tenantId: string, studentId: string, userId: string) {
    return await this.repository.update(studentId, {
      admissionStatus: "approved",
      updatedBy: userId,
      updatedAt: new Date()
    }, tenantId);
  }

  /**
   * Reject Student Admission
   */
  async rejectAdmission(tenantId: string, studentId: string, userId: string) {
    return await this.repository.update(studentId, {
      admissionStatus: "rejected",
      updatedBy: userId,
      updatedAt: new Date()
    }, tenantId);
  }

  /**
   * Student 360 View (Enterprise Aggregate Root)
   */
  async student360(tenantId: string, studentId: string): Promise<Student360Aggregate | null> {
    const student = await this.getById(tenantId, studentId);
    if (!student) return null;

    // TODO: Integrate with Attendance, Fees, Marks, Behavior Repositories in Phase 5
    return {
      student: {
        ...student,
        id: student.studentId || student.id!,
      },
      attendance: {
        present: 0,
        absent: 0,
        late: 0,
        percentage: 0,
      },
      fees: {
        totalDue: 0,
        totalPaid: 0,
        outstanding: 0,
        records: [],
      },
      marks: {
        exams: [],
        average: 0,
        trend: "stable",
      },
      behavior: {
        logs: [],
        incidents: 0,
      },
      transport: null,
      hostel: null,
      timeline: [],
      aiSummary: "",
    };
  }

  // ==========================================================
  // 🚀 FUTURE ENTERPRISE STUBS (To prevent build errors)
  // ==========================================================

  async promote(tenantId: string, studentIds: string[], newClass: string, newSection: string, userId: string) {
    // Implementation pending: Use repository.batchUpdate or transaction
    return { success: true, promoted: studentIds.length };
  }

  async archive(tenantId: string, studentId: string, userId: string) {
    return await this.repository.update(studentId, { status: "archived", updatedBy: userId }, tenantId);
  }

  async restore(tenantId: string, studentId: string, userId: string) {
    return await this.repository.update(studentId, { deleted: false, status: "Active", updatedBy: userId }, tenantId);
  }

  async getTimeline(tenantId: string, studentId: string) {
    return []; // TODO: Fetch from Audit/Event store
  }

  async bulkImport(tenantId: string, data: any[], userId: string) {
    // Implementation pending
    return { success: true, imported: data.length };
  }

  async export(tenantId: string, filter: any) {
    return []; // Implementation pending
  }

  async analytics(tenantId: string) {
    return {
      total: 0,
      active: 0,
      graduated: 0,
      transferred: 0,
      suspended: 0,
      archived: 0,
      dropped: 0,
      byClass: {},
      bySection: {},
      byGender: {},
      byHouse: {},
      riskCount: 0
    }; // Implementation pending
  }
}
