// services/StudentService.ts
import { IStudentRepository } from "@/interfaces/IStudentRepository";
import { StudentRepository } from "@/repositories/student.repository";
import { AttendanceRepository } from "@/repositories/attendance.repository";
import { MarksRepository } from "@/repositories/marks.repository";
import { FeesRepository } from "@/repositories/fees.repository";
import { BehaviorRepository } from "@/repositories/behavior.repository";
import { Student, Student360Aggregate, StudentAnalytics, StudentFilter, TimelineEntry, PromotionRecord } from "@/types/student";
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
import { invalidateCache, getOrSet } from "@/lib/cache";

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
    // 🚀 Flatten the Domain Model for DB validation
    const flatData: any = {
      fullName: data.personal?.firstName ? `${data.personal.firstName} ${data.personal.lastName || ""}`.trim() : data.fullName,
      fatherName: data.metadata?.extendedData?.fatherName || "",
      cnic: data.identity?.cnicOrBForm || "",
      dateOfBirth: data.personal?.dateOfBirth || "",
      gender: data.personal?.gender || "Male",
      phone: data.metadata?.extendedData?.phone || "",
      email: data.metadata?.extendedData?.email || "",
      address: data.metadata?.extendedData?.address || "",
      
      classGrade: data.academic?.classId || data.classGrade,
      section: data.academic?.sectionId || "A",
      rollNumber: data.identity?.rollNumber,
      admissionNumber: data.identity?.admissionNumber,
      
      guardianName: data.metadata?.extendedData?.guardianName || "",
      guardianRelation: data.metadata?.extendedData?.guardianRelation || "",
      guardianPhone: data.metadata?.extendedData?.guardianPhone || data.parentReferences?.emergencyContactPhone || "",
      
      bloodGroup: data.metadata?.extendedData?.bloodGroup || "",
      religion: data.metadata?.extendedData?.religion || "Islam",
      nationality: data.metadata?.extendedData?.nationality || "",
      previousSchool: data.metadata?.extendedData?.previousSchool || "",
      medicalConditions: data.metadata?.extendedData?.medicalConditions || "",
      
      photoBase64: data.personal?.avatarUrl || "",
      status: data.status || "Active",
    };

    // Remove undefined values so Zod defaults can take over
    Object.keys(flatData).forEach(key => flatData[key] === undefined && delete flatData[key]);

    const validation = this.validation.validate(CreateStudentSchema, flatData);
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
      admissionStatus: "approved", // Auto-approve if created from Add Student page
    };

    const id = await this.repository.create(docData, tenantId);
    const student = await this.repository.findById(id, tenantId);

    // Cache invalidation
    await invalidateCache(`dashboard:${tenantId}`);

    // Publish event
    await eventBus.publish(EVENTS.STUDENT_CREATED, {
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
    // Fetch existing student to detect changes
    const existing = await this.getById(tenantId, id);

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

    // Publish STUDENT_UPDATED event
    await eventBus.publish(EVENTS.STUDENT_UPDATED, {
      tenantId,
      studentId: id,
      updates: validation.data,
    });

    // Detect field-level changes and publish specific events
    if (validation.data.classGrade && validation.data.classGrade !== existing.classGrade) {
      await eventBus.publish(EVENTS.CLASS_CHANGED, {
        tenantId,
        studentId: id,
        oldClass: existing.classGrade,
        newClass: validation.data.classGrade,
      });
    }
    if (validation.data.section && validation.data.section !== existing.section) {
      await eventBus.publish(EVENTS.SECTION_CHANGED, {
        tenantId,
        studentId: id,
        oldSection: existing.section,
        newSection: validation.data.section,
      });
    }
    if (validation.data.rollNumber !== undefined && validation.data.rollNumber !== existing.rollNumber) {
      await eventBus.publish(EVENTS.ROLL_NUMBER_CHANGED, {
        tenantId,
        studentId: id,
        oldRollNumber: existing.rollNumber,
        newRollNumber: validation.data.rollNumber,
      });
    }

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

    // Publish event
    await eventBus.publish(EVENTS.STUDENT_DELETED, {
      tenantId,
      studentId: id,
      studentData: { fullName: student.fullName, classGrade: student.classGrade, section: student.section },
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

        // Build promotion history entry
        const promoRecord: PromotionRecord = {
          fromClass: oldClass,
          fromSection: oldSection,
          toClass: newClassGrade,
          toSection: newSection,
          academicYear,
          promotedAt: new Date().toISOString(),
          promotedBy: userId,
        };

        const existingHistory = student.promotionHistory || [];

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
            promotionHistory: [...existingHistory, promoRecord],
          } as Partial<Student>,
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

      // Publish promotion event
      await eventBus.publish(EVENTS.STUDENT_PROMOTED, {
        tenantId,
        studentIds: promoted,
        newClassGrade,
        newSection,
        academicYear,
        promotedBy: userId,
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

    // Invalidate dashboard cache
    await invalidateCache(`dashboard:${tenantId}`);

    await this.audit.log({
      action: "student.admission_approved",
      userId,
      tenantId,
      entityId: studentId,
      entityType: "student",
      metadata: { fullName: student.fullName },
    });

    // Publish events
    await eventBus.publish(EVENTS.ADMISSION_APPROVED, {
      tenantId,
      studentId,
      studentData: { fullName: student.fullName, classGrade: student.classGrade, section: student.section },
    });

    // Publish STUDENT_ENROLLED for full lifecycle cascade
    await eventBus.publish(EVENTS.STUDENT_ENROLLED, {
      tenantId,
      studentId,
      studentData: {
        fullName: student.fullName,
        classGrade: student.classGrade,
        section: student.section,
        rollNumber: student.rollNumber,
      },
      approvedBy: userId,
    });

    await eventBus.publish(EVENTS.STUDENT_UPDATED, {
      tenantId,
      studentId,
      updates: { admissionStatus: "approved" },
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

    // Publish event
    await eventBus.publish(EVENTS.STUDENT_UPDATED, {
      tenantId,
      studentId,
      updates: { admissionStatus: "rejected" },
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

  async getByClassAndSection(
    tenantId: string,
    className: string,
    section: string
  ): Promise<(Student & { id: string })[]> {
    return this.repository.findBySection(className, section, tenantId);
  }

  // ─── Enterprise Methods ────────────────────────────────────────────────────

  async transfer(
    tenantId: string,
    studentId: string,
    reason: string,
    userId: string
  ): Promise<void> {
    const student = await this.getById(tenantId, studentId);
    await this.repository.update(studentId, { status: "transferred" } as Partial<Student>, tenantId);

    await invalidateCache(`dashboard:${tenantId}`);

    await this.audit.log({
      action: "student.transferred",
      userId,
      tenantId,
      entityId: studentId,
      entityType: "student",
      metadata: { fullName: student.fullName, reason },
    });

    await eventBus.publish(EVENTS.STUDENT_UPDATED, {
      tenantId,
      studentId,
      updates: { status: "transferred", reason },
    });
  }

  async graduate(
    tenantId: string,
    studentIds: string[],
    academicYear: string,
    userId: string
  ): Promise<{ graduated: number; errors: string[] }> {
    const graduated: string[] = [];
    const errors: string[] = [];

    for (const studentId of studentIds) {
      try {
        await this.repository.update(
          studentId,
          { status: "graduated", academicYear, promotedAt: new Date(), promotedBy: userId, updatedBy: userId } as Partial<Student>,
          tenantId
        );
        graduated.push(studentId);
      } catch (err: any) {
        errors.push(`Student ${studentId}: ${err.message}`);
      }
    }

    if (graduated.length > 0) {
      await this.audit.log({
        action: "student.graduate",
        userId,
        tenantId,
        entityType: "student",
        metadata: { count: graduated.length, academicYear },
      });

      await invalidateCache(`dashboard:${tenantId}`);
    }

    return { graduated: graduated.length, errors };
  }

  async archive(tenantId: string, studentId: string, userId: string): Promise<void> {
    await this.getById(tenantId, studentId);
    await this.repository.archive(tenantId, studentId);

    await invalidateCache(`dashboard:${tenantId}`);

    await this.audit.log({
      action: "student.archived",
      userId,
      tenantId,
      entityId: studentId,
      entityType: "student",
    });
  }

  async restore(tenantId: string, studentId: string, userId: string): Promise<void> {
    await this.repository.restore(tenantId, studentId);

    await invalidateCache(`dashboard:${tenantId}`);

    await this.audit.log({
      action: "student.restored",
      userId,
      tenantId,
      entityId: studentId,
      entityType: "student",
    });
  }

  async bulkUpdate(
    tenantId: string,
    ids: string[],
    data: Partial<Student>,
    userId: string
  ): Promise<void> {
    await this.repository.bulkUpdate(tenantId, ids, data);

    await invalidateCache(`dashboard:${tenantId}`);

    await this.audit.log({
      action: "student.bulk_updated",
      userId,
      tenantId,
      entityType: "student",
      metadata: { count: ids.length, updatedFields: Object.keys(data) },
    });
  }

  async bulkDelete(
    tenantId: string,
    ids: string[],
    userId: string
  ): Promise<void> {
    await this.repository.bulkDelete(tenantId, ids);

    await invalidateCache(`dashboard:${tenantId}`);

    await this.audit.log({
      action: "student.bulk_deleted",
      userId,
      tenantId,
      entityType: "student",
      metadata: { count: ids.length },
    });
  }

  async student360(
    tenantId: string,
    studentId: string
  ): Promise<Student360Aggregate> {

    const student = await this.getById(tenantId, studentId);

    let attendanceRecords: any[] = [];
    let marksRecords: any[] = [];
    let feeRecords: any[] = [];
    let behaviorRecords: any[] = [];
    let timelineEntries: any[] = [];

    try {
      attendanceRecords = await new AttendanceRepository()
        .findByStudentId(tenantId, studentId);

      console.log("✅ AttendanceRepository OK");
    } catch (err) {
      console.error("❌ AttendanceRepository FAILED");
      console.error(err);
    }

    try {
      marksRecords = await new MarksRepository()
        .findByStudent(tenantId, studentId);

      console.log("✅ MarksRepository OK");
    } catch (err) {
      console.error("❌ MarksRepository FAILED");
      console.error(err);
    }

    try {
      feeRecords = await new FeesRepository()
        .findByStudent(tenantId, studentId, 50);

      console.log("✅ FeesRepository OK");
    } catch (err) {
      console.error("❌ FeesRepository FAILED");
      console.error(err);
    }

    try {
      behaviorRecords = await new BehaviorRepository()
        .findByStudent(studentId, tenantId, 50);

      console.log("✅ BehaviorRepository OK");
    } catch (err) {
      console.error("❌ BehaviorRepository FAILED");
      console.error(err);
    }

    try {
      timelineEntries = await this.repository.timeline(
        tenantId,
        studentId
      );

      console.log("✅ TimelineRepository OK");
    } catch (err) {
      console.error("❌ TimelineRepository FAILED");
      console.error(err);
    }

    const present = attendanceRecords.filter(
      (r: any) => r.status === "Present"
    ).length;

    const absent = attendanceRecords.filter(
      (r: any) => r.status === "Absent"
    ).length;

    const late = attendanceRecords.filter(
      (r: any) => r.status === "Late"
    ).length;

    const totalAtt = present + absent + late;

    const attendancePct =
      totalAtt > 0
        ? Math.round((present / totalAtt) * 100)
        : 0;

    const avgMarks =
      marksRecords.length > 0
        ? Math.round(
            marksRecords.reduce(
              (sum: number, m: any) =>
                sum + (m.obtainedMarks || 0),
              0
            ) / marksRecords.length
          )
        : 0;

    const totalDue = feeRecords.reduce(
      (sum: number, f: any) =>
        sum + (f.totalAmount || f.amount || 0),
      0
    );

    const totalPaid = feeRecords.reduce(
      (sum: number, f: any) =>
        sum + (f.paidAmount || 0),
      0
    );

    return {
      student,

      attendance: {
        present,
        absent,
        late,
        percentage: attendancePct,
      },

      fees: {
        totalDue,
        totalPaid,
        outstanding: totalDue - totalPaid,
        records: feeRecords,
      },

      marks: {
        exams: marksRecords,
        average: avgMarks,
        trend:
          avgMarks >= 60
            ? "improving"
            : "declining",
      },

      behavior: {
        logs: behaviorRecords,
        incidents: behaviorRecords.length,
      },

      transport: null,

      hostel: null,

      timeline: timelineEntries,
    };
  }

  async getAnalytics(tenantId: string): Promise<StudentAnalytics> {
    return this.repository.studentAnalytics(tenantId);
  }

  async getTimeline(tenantId: string, studentId: string): Promise<TimelineEntry[]> {
    return this.repository.timeline(tenantId, studentId);
  }

  async getRiskData(tenantId: string): Promise<any[]> {
    const students = await this.repository.findAll(tenantId);
    if (students.length === 0) return [];

    const studentIds = students.map(s => s.id);
    const attendanceRepo = new AttendanceRepository();
    const allAttendance = await attendanceRepo.findByStudentIds(tenantId, studentIds, 30);

    const attendanceByStudent: Record<string, { present: number; total: number }> = {};
    for (const rec of allAttendance) {
      const sid = (rec as any).studentId;
      if (!attendanceByStudent[sid]) attendanceByStudent[sid] = { present: 0, total: 0 };
      attendanceByStudent[sid].total++;
      if (rec.status === "Present") attendanceByStudent[sid].present++;
    }

    const riskStudents: any[] = [];
    for (const student of students) {
      const stats = attendanceByStudent[student.id] || { present: 0, total: 0 };
      const attendancePct = stats.total > 0 ? (stats.present / stats.total) * 100 : 100;

      if (attendancePct < 60) {
        riskStudents.push({
          ...student,
          attendance: Math.round(attendancePct),
          marks: 0,
          riskReason: "Low Attendance",
        });
      }
    }

    return riskStudents;
  }

  async getDashboardStats(tenantId: string): Promise<{
    total: number; active: number; graduated: number; transferred: number;
    suspended: number; archived: number; riskCount: number;
  }> {
    const analytics = await this.repository.studentAnalytics(tenantId);
    return {
      total: analytics.total,
      active: analytics.active,
      graduated: analytics.graduated,
      transferred: analytics.transferred,
      suspended: analytics.suspended,
      archived: analytics.archived,
      riskCount: analytics.riskCount,
    };
  }

  async advancedFilter(
    tenantId: string,
    filter: StudentFilter
  ): Promise<PaginatedResult<Student & { id: string }>> {
    return this.repository.advancedFilter(tenantId, filter);
  }
}
