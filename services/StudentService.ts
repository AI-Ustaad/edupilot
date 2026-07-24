// services/StudentService.ts
import { CreateStudentSchema } from "@/validators/student";
import { StudentPersistenceMapper } from "@/lib/mappers/StudentPersistenceMapper";
import { BusinessError } from "@/errors";
import { StudentRepository } from "@/repositories/student.repository"; 
import type { StudentEntity, Student360Aggregate, StudentComment } from "@/entities/student.entity";

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
  // 🚀 ENTERPRISE METHODS
  // ==========================================================

  /**
   * Promote Students to Next Class/Section
   */
  async promote(
    tenantId: string, 
    studentIds: string[], 
    newClass: string, 
    newSection: string, 
    academicYear: string,
    userId: string
  ) {
    const errors: string[] = [];
    let promotedCount = 0;

    for (const studentId of studentIds) {
      try {
        await this.repository.update(studentId, {
          classGrade: newClass,
          section: newSection,
          academicYear: academicYear || undefined,
          updatedBy: userId,
          updatedAt: new Date()
        }, tenantId);
        
        promotedCount++;
      } catch (error: any) {
        errors.push(`Failed to promote student ${studentId}: ${error.message}`);
      }
    }

    return { 
      success: true, 
      promoted: promotedCount,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Archive Student
   */
  async archive(tenantId: string, studentId: string, userId: string) {
    return await this.repository.update(studentId, { status: "archived", updatedBy: userId }, tenantId);
  }

  /**
   * Add Comment to Student Profile
   * Supports Student 360 Timeline & Audit Trail
   */
  async addComment(
    tenantId: string, 
    studentId: string, 
    comment: string, 
    userId: string
  ): Promise<void> {
    // Validate student exists
    const student = await this.getById(tenantId, studentId);
    
    if (!student) {
      throw new BusinessError(`Student with ID ${studentId} not found`);
    }

    // Create new comment object matching StudentComment interface
    const newComment: StudentComment = {
      id: crypto.randomUUID(),
      comment,
      commentedBy: userId,
      commentedAt: new Date().toISOString(),
      type: 'comment'
    };

    // Get existing comments array (handle undefined)
    const existingComments = student.comments || [];
    
    // Update student document with new comment
    await this.repository.update(studentId, {
      comments: [...existingComments, newComment],
      updatedBy: userId,
      updatedAt: new Date()
    }, tenantId);
  }

  /**
   * Restore Deleted Student
   */
  async restore(tenantId: string, studentId: string, userId: string) {
    return await this.repository.update(studentId, { deleted: false, status: "Active", updatedBy: userId }, tenantId);
  }

  /**
   * Get Student Timeline
   */
  async getTimeline(tenantId: string, studentId: string) {
    return []; // TODO: Fetch from Audit/Event store
  }

  /**
   * Bulk Create Students (Excel Import)
   * Used by /api/v1/students/bulk route
   */
  async bulkCreate(students: any[], tenantId: string, userId: string) {
    const results = {
      count: 0,
      success: [] as string[],
      failed: [] as { student: any; error: string }[],
    };

    for (const studentData of students) {
      try {
        // Map flat Excel data to Domain Aggregate structure
        const aggregateData = {
          identity: {
            admissionNumber: `ADM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            rollNumber: studentData.rollNumber ? parseInt(studentData.rollNumber) : undefined,
            cnicOrBForm: studentData.cnic || undefined,
          },
          personal: {
            firstName: studentData.fullName || studentData.firstName || "Unknown",
            lastName: studentData.lastName || "",
            gender: (studentData.gender || "Male") as "Male" | "Female" | "Other",
            dateOfBirth: studentData.dob || studentData.dateOfBirth || undefined,
          },
          academic: {
            campusId: studentData.campusId || "default-campus",
            classId: studentData.classGrade || studentData.classId || "Unknown",
            sectionId: studentData.section || studentData.sectionId || "A",
            admissionDate: studentData.admissionDate || new Date().toISOString(),
          },
          contacts: {
            primaryPhone: studentData.phone || studentData.guardianPhone || "",
            email: studentData.email || undefined,
            address: {
              street: studentData.address || "",
              city: studentData.city || "",
              state: studentData.state || "",
              zipCode: studentData.zipCode || "",
              country: studentData.country || "Pakistan",
            },
          },
          guardian: {
            fatherName: studentData.fatherName || "N/A",
            fatherPhone: studentData.guardianPhone || studentData.fatherPhone || "",
            fatherOccupation: studentData.fatherOccupation || "",
            motherName: studentData.motherName || "",
            motherPhone: studentData.motherPhone || "",
            motherOccupation: studentData.motherOccupation || "",
          },
          medical: {
            bloodGroup: studentData.bloodGroup || undefined,
            allergies: studentData.allergies || [],
            chronicConditions: studentData.medicalConditions || [],
            emergencyContactName: studentData.emergencyContactName || studentData.guardianName || "",
            emergencyContactPhone: studentData.emergencyContactPhone || studentData.guardianPhone || "",
            emergencyContactRelation: studentData.emergencyContactRelation || "Parent",
          },
          demographics: {
            religion: studentData.religion || "",
            nationality: studentData.nationality || "Pakistani",
            caste: studentData.caste || undefined,
            language: studentData.language || "Urdu",
          },
          parentReferences: {
            primaryParentId: studentData.primaryParentId || null,
            emergencyContactPhone: studentData.emergencyContactPhone || studentData.guardianPhone || "",
          },
        };

        // Create student using the main create method
        await this.create(aggregateData, tenantId, userId);
        
        results.count++;
        results.success.push(studentData.fullName || studentData.firstName || "Unknown");
      } catch (error: any) {
        results.failed.push({
          student: studentData,
          error: error.message || "Unknown error",
        });
      }
    }

    return results;
  }

  /**
   * Bulk Import (Legacy - kept for backward compatibility)
   */
  async bulkImport(tenantId: string, data: any[], userId: string) {
    return this.bulkCreate(data, tenantId, userId);
  }

  /**
   * Export Students
   */
  async export(tenantId: string, filter: any) {
    return []; // Implementation pending
  }

  /**
   * Student Analytics
   */
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
