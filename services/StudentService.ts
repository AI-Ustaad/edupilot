// services/StudentService.ts

import { CreateStudentSchema } from "@/validators/student";
import { StudentPersistenceMapper } from "@/lib/mappers/StudentPersistenceMapper";
import { BusinessError } from "@/errors";
import { StudentRepository } from "@/repositories/student.repository"; 

export class StudentService {
  private repository: StudentRepository;

  constructor() {
    this.repository = new StudentRepository(); 
  }

  /**
   * Create Student Use-Case (Enterprise Flow)
   */
  async create(data: any, tenantId: string, userId: string) {
    // 1. Direct Zod Parse (ZodError will be caught by withErrorHandler)
    const validatedAggregate = CreateStudentSchema.parse(data);

    // 2. Map the validated Aggregate to Legacy Flat Firestore Document
    const document = StudentPersistenceMapper.toFirestore(validatedAggregate, userId);

    // 3. Duplicate Check (To be replaced by Transaction in Phase 3)
    if (document.rollNumber) {
      const existing = await this.repository.findByRollNumber(document.rollNumber, tenantId);
      if (existing) {
        throw new BusinessError(`Student with roll number ${document.rollNumber} already exists`);
      }
    }

    // 4. Save to Repository
    const savedDoc = await this.repository.save({
      ...document,
      tenantId,
    }, tenantId);
    
    // 5. Return Mapped Entity
    return StudentPersistenceMapper.fromFirestore(savedDoc);
  }

  /**
   * Get Student By ID
   */
  async getById(tenantId: string, studentId: string) {
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
  async delete(tenantId: string, studentId: string) {
    return await this.repository.softDelete(studentId, tenantId);
  }

  /**
   * Hard Delete Student (Permanent Delete)
   */
  async hardDelete(tenantId: string, studentId: string, userId: string) {
    // Here you can also add logic to delete related records (attendance, fees, etc.) if needed
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
}
