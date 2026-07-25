// services/StudentService.ts

import { CreateStudentSchema } from "@/dto/CreateStudentDTO";
import { StudentPersistenceMapper } from "@/lib/mappers/StudentPersistenceMapper";
import { StudentRequestMapper } from "@/lib/mappers/StudentRequestMapper";
import { StudentResponseMapper } from "@/lib/mappers/StudentResponseMapper";
import { BusinessError } from "@/errors";
import { StudentRepository } from "@/repositories/student.repository"; 
import type { StudentEntity, Student360Aggregate, StudentComment } from "@/entities/student.entity";
import { randomUUID } from "crypto";

export class StudentService {
  private repository: StudentRepository;

  constructor() {
    this.repository = new StudentRepository(); 
  }

  /**
   * Create Student Use-Case (Enterprise Flow)
   */
  async create(data: any, tenantId: string, userId: string): Promise<StudentEntity> {
    // 1. Validate DTO
    const validatedDTO = CreateStudentSchema.parse(data);
    
    // 2. Convert DTO -> Domain Entity
    const entity = StudentRequestMapper.toEntity(validatedDTO);
    
    // 3. Map Domain Entity -> Firestore Document
    const document = StudentPersistenceMapper.toFirestore(entity, userId);

    // 4. Duplicate Check
    if (document.rollNumber) {
      const rollNum = typeof document.rollNumber === "string" ? document.rollNumber : String(document.rollNumber);
      const existing = await this.repository.findByRollNumber(rollNum, tenantId);
      if (existing) {
        throw new BusinessError(`Student with roll number ${rollNum} already exists`);
      }
    }

    // 5. Save to Repository
    const savedDoc = await this.repository.save({
      ...document,
      tenantId,
    }, tenantId);
    
    // 6. Return Mapped Entity
    return StudentPersistenceMapper.fromFirestore(savedDoc);
  }

  /**
   * Update Student
   */
  async update(studentId: string, data: any, tenantId: string, userId: string): Promise<StudentEntity | null> {
    // For update, we map partial data directly to document format to avoid overwriting nested fields
    const document = StudentPersistenceMapper.toFirestore(data as any, userId);
    
    // Remove undefined fields to avoid overwriting existing data with nulls
    Object.keys(document).forEach(key => {
      if (document[key as keyof typeof document] === undefined) {
        delete document[key as keyof typeof document];
      }
    });

    await this.repository.update(studentId, {
      ...document,
      updatedBy: userId,
      updatedAt: new Date()
    } as any, tenantId);
    
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
    } as any, tenantId);
  }

  /**
   * Reject Student Admission
   */
  async rejectAdmission(tenantId: string, studentId: string, userId: string) {
    return await this.repository.update(studentId, {
      admissionStatus: "rejected",
      updatedBy: userId,
      updatedAt: new Date()
    } as any, tenantId);
  }

  /**
   * Student 360 View (Enterprise Aggregate Root)
   */
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

  /**
   * Add Comment to Student Profile (Enterprise)
   */
  async addComment(
    tenantId: string, 
    studentId: string, 
    comment: string, 
    userId: string
  ): Promise<void> {
    const student = await this.getById(tenantId, studentId);
    
    if (!student) {
      throw new BusinessError(`Student with ID ${studentId} not found`);
    }

    const commentData: StudentComment = {
      id: randomUUID(),
      comment,
      commentedBy: userId,
      commentedAt: new Date().toISOString(),
      type: 'comment'
    };

    const existingComments = student.comments || [];
    
    await this.repository.update(studentId, {
      comments: [...existingComments, commentData],
      updatedBy: userId,
      updatedAt: new Date()
    } as any, tenantId);
  }

  // ==========================================================
  // 🚀 FUTURE ENTERPRISE STUBS
  // ==========================================================

  async promote(tenantId: string, studentIds: string[], newClass: string, newSection: string, userId: string) {
    return { success: true, promoted: studentIds.length };
  }

  async archive(tenantId: string, studentId: string, userId: string) {
    return await this.repository.update(studentId, { status: "archived", updatedBy: userId } as any, tenantId);
  }

  async restore(tenantId: string, studentId: string, userId: string) {
    return await this.repository.update(studentId, { deleted: false, status: "Active", updatedBy: userId } as any, tenantId);
  }

  async getTimeline(tenantId: string, studentId: string) {
    return [];
  }

  async bulkImport(tenantId: string, data: any[], userId: string) {
    return { success: true, imported: data.length };
  }

  async analytics(tenantId: string) {
    return {
      total: 0, active: 0, graduated: 0, transferred: 0, suspended: 0, archived: 0, dropped: 0,
      byClass: {}, bySection: {}, byGender: {}, byHouse: {}, riskCount: 0
    };
  }
}
