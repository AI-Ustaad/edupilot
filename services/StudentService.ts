// services/StudentService.ts
import { CreateStudentSchema } from "@/dto/CreateStudentDTO";
import type { CreateStudentDTO, UpdateStudentDTO } from "@/dto";
import { StudentPersistenceMapper } from "@/lib/mappers/StudentPersistenceMapper";
import { BusinessError } from "@/errors";
import { SubscriptionLimitException } from "@/errors/AppError";
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
import { logger } from "@/lib/logger/logger";
import { adminDb } from "@/lib/firebase-admin";

function normalizeCreateStudentInput(data: any): CreateStudentDTO {
  if (data?.personal && data?.academic) {
    return data as CreateStudentDTO;
  }
  const rawName = (data?.fullName || data?.name || "").trim();
  const nameParts = rawName ? rawName.split(" ") : ["Student"];
  const firstName = nameParts[0] || "Student";
  const lastName = nameParts.slice(1).join(" ") || undefined;

  return {
    identity: {
      admissionNumber: data?.admissionNumber || `ADM-${Date.now()}`,
      rollNumber: data?.rollNumber !== undefined ? String(data.rollNumber) : undefined,
      cnicOrBForm: data?.cnic || data?.cnicOrBForm || "",
    },
    personal: {
      firstName,
      lastName,
      dateOfBirth: data?.dob || data?.dateOfBirth,
      gender: (data?.gender === "Female" || data?.gender === "Other") ? data.gender : "Male",
      avatarUrl: data?.avatarUrl || data?.photoBase64 || "",
    },
    academic: {
      campusId: data?.campusId || "main",
      classId: data?.classGrade || data?.className || data?.classId || "General",
      sectionId: data?.section || data?.sectionId || "A",
      admissionDate: data?.admissionDate || new Date().toISOString().split("T")[0],
    },
    parentReferences: {
      primaryParentId: data?.parentId || data?.primaryParentId || null,
      emergencyContactPhone: data?.guardianPhone || data?.emergencyContactPhone || data?.phone || "",
    },
    contacts: {
      phone: data?.phone || data?.guardianPhone || "",
      email: data?.email || data?.guardianEmail || "",
      address: data?.address || "",
    },
    guardian: {
      name: data?.guardianName || data?.fatherName || "",
      relation: data?.guardianRelation || "Guardian",
      phone: data?.guardianPhone || data?.phone || "",
    },
    status: data?.status || "Active",
  };
}

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

  async create(data: CreateStudentDTO | any, tenantId: string, userId: string): Promise<StudentEntity> {
    const normalizedInput = normalizeCreateStudentInput(data);
    const validatedDTO = CreateStudentSchema.parse(normalizedInput);
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
    const studentId = createdEntity.studentId || savedDoc.id || "";

    // 100% Cross-Module Sync: Provision Initial Fee Record
    try {
      const monthlyFee = (data as any)?.monthlyFee !== undefined ? Number((data as any).monthlyFee) : 5000;
      const initialFee = {
        studentId,
        studentName: document.fullName || `${document.firstName || ""} ${document.lastName || ""}`.trim(),
        rollNumber: document.rollNumber ? (Number(document.rollNumber) || document.rollNumber) : undefined,
        classGrade: document.classGrade || "General",
        section: document.section || "A",
        feeMonth: new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
        amountPaid: 0,
        amount: monthlyFee,
        status: "Pending",
        paymentMethod: "Pending",
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
        tenantId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const db = (this.repository as any).db || adminDb;
      if (db?.collection) {
        await db.collection("fees").add(initialFee);
      }
    } catch (err) {
      logger.warn("[StudentService] Could not provision initial fee profile", { metadata: { studentId, err } });
    }

    // 100% Cross-Module Sync: Roster Class/Section verification
    try {
      const db = (this.repository as any).db || adminDb;
      if (db?.collection && document.classGrade) {
        const secSnap = await db.collection("sections")
          .where("tenantId", "==", tenantId)
          .where("classGrade", "==", document.classGrade)
          .where("sectionName", "==", document.section || "A")
          .get();
        if (secSnap?.empty) {
          await db.collection("sections").add({
            classGrade: document.classGrade,
            sectionName: document.section || "A",
            tenantId,
            deleted: false,
            createdAt: new Date().toISOString(),
            createdBy: userId,
          });
        }
      }
    } catch (err) {
      logger.warn("[StudentService] Could not ensure section roster existence", { metadata: { studentId, err } });
    }

    eventBus.publish(EVENTS.STUDENT_CREATED, {
      tenantId,
      studentId,
      studentData: {
        firstName: document.firstName,
        lastName: document.lastName,
        fullName: document.fullName,
        classGrade: document.classGrade,
        section: document.section,
      },
      userId,
      createdBy: userId,
    }, tenantId);

    return createdEntity;
  }

  async update(tenantId: string, studentId: string, data: UpdateStudentDTO | any, userId: string): Promise<StudentEntity | null> {
    const existing = await this.repository.findById(studentId, tenantId);
    if (!existing) return null;

    // Support flat inputs alongside nested DTO
    const flatFullName = (data as any).fullName || (data as any).name;
    const flatRoll = (data as any).rollNumber;
    const flatClass = (data as any).classGrade || (data as any).className;
    const flatSection = (data as any).section;
    const flatGuardianName = (data as any).guardianName || (data as any).fatherName;
    const flatGuardianPhone = (data as any).guardianPhone;
    const flatGuardianEmail = (data as any).guardianEmail;
    const flatEmail = (data as any).email || flatGuardianEmail;
    const flatPhone = (data as any).phone || flatGuardianPhone;
    const flatAddress = (data as any).address;
    const flatDob = (data as any).dob;
    const flatGender = (data as any).gender;
    const flatStatus = (data as any).status;
    const flatMonthlyFee = (data as any).monthlyFee;

    const current = StudentPersistenceMapper.fromFirestore(existing);
    const merged = {
      identity: {
        ...current.identity,
        ...(data.identity || {}),
        ...(flatRoll !== undefined ? { rollNumber: Number(flatRoll) || flatRoll } : {}),
      },
      personal: {
        ...current.personal,
        ...(data.personal || {}),
        ...(flatFullName ? {
          firstName: flatFullName.split(" ")[0],
          lastName: flatFullName.split(" ").slice(1).join(" ") || undefined
        } : {}),
        ...(flatDob ? { dateOfBirth: flatDob } : {}),
        ...(flatGender ? { gender: flatGender } : {}),
      },
      academic: {
        ...current.academic,
        ...(data.academic || {}),
        ...(flatClass ? { classId: flatClass } : {}),
        ...(flatSection ? { sectionId: flatSection } : {}),
      },
      parentReferences: {
        ...current.parentReferences,
        ...(data.parentReferences || {}),
        ...(flatGuardianPhone ? { emergencyContactPhone: flatGuardianPhone } : {}),
      },
      contacts: {
        ...current.contacts,
        ...(data.contacts || {}),
        ...(flatPhone ? { phone: flatPhone } : {}),
        ...(flatEmail ? { email: flatEmail } : {}),
        ...(flatAddress ? { address: flatAddress } : {}),
      },
      guardian: {
        ...current.guardian,
        ...(data.guardian || {}),
        ...(flatGuardianName ? { name: flatGuardianName } : {}),
        ...(flatGuardianPhone ? { phone: flatGuardianPhone } : {}),
      },
      medical: { ...current.medical, ...(data.medical || {}) },
      demographics: { ...current.demographics, ...(data.demographics || {}) },
      status: flatStatus ?? data.status ?? current.status,
      metadata: { ...current.metadata, ...(data.metadata || {}) },
    };

    const entity = StudentPersistenceMapper.fromDTO(merged);
    const document = StudentPersistenceMapper.toFirestore(entity, userId);
    document.metadata = {
      ...existing.metadata,
      ...document.metadata,
      createdAt: existing.metadata?.createdAt,
    };

    // Explicitly retain flat top-level fields for backwards/cross-module compatibility
    if (flatFullName) document.fullName = flatFullName;
    if (flatRoll !== undefined) document.rollNumber = String(flatRoll);
    if (flatClass) document.classGrade = flatClass;
    if (flatSection) document.section = flatSection;
    if (flatGuardianName) document.guardianName = flatGuardianName;
    if (flatGuardianPhone) document.guardianPhone = flatGuardianPhone;
    if (flatEmail) document.email = flatEmail;
    if (flatPhone) document.phone = flatPhone;
    if (flatAddress) document.address = flatAddress;
    if (flatDob) document.dob = flatDob;
    if (flatGender) document.gender = flatGender;
    if (flatStatus) document.status = flatStatus;
    if (flatMonthlyFee !== undefined) (document as any).monthlyFee = Number(flatMonthlyFee);

    const updatePayload: Record<string, unknown> = { ...document, updatedBy: userId, updatedAt: new Date() };
    Object.keys(updatePayload).forEach(key => {
      if (updatePayload[key as keyof typeof updatePayload] === undefined) {
        delete updatePayload[key as keyof typeof updatePayload];
      }
    });

    await this.repository.update(studentId, updatePayload as Parameters<IStudentRepository["update"]>[1], tenantId);

    // 100% Cross-Module Cascading Updates (Fees, Attendance, Marks, Invoices)
    await this.cascadeStudentUpdates(tenantId, studentId, {
      fullName: document.fullName,
      rollNumber: document.rollNumber,
      classGrade: document.classGrade,
      section: document.section,
    });

    const updated = await this.getById(tenantId, studentId);

    eventBus.publish(EVENTS.STUDENT_UPDATED, {
      tenantId,
      studentId,
      updates: updatePayload,
    }, tenantId);

    return updated;
  }

  private async cascadeStudentUpdates(
    tenantId: string,
    studentId: string,
    updates: {
      fullName?: string;
      rollNumber?: string | number;
      classGrade?: string;
      section?: string;
    }
  ): Promise<void> {
    const db = (this.repository as any).db || adminDb;
    if (!db) return;

    const patchData: Record<string, any> = {};
    if (updates.fullName) {
      patchData.studentName = updates.fullName;
      patchData.fullName = updates.fullName;
    }
    if (updates.rollNumber !== undefined) {
      patchData.rollNumber = updates.rollNumber;
    }
    if (updates.classGrade) {
      patchData.classGrade = updates.classGrade;
      patchData.className = updates.classGrade;
    }
    if (updates.section) {
      patchData.section = updates.section;
    }

    if (Object.keys(patchData).length === 0) return;

    // 1. Cascade to fees
    try {
      const feesSnap = await db.collection("fees")
        .where("tenantId", "==", tenantId)
        .where("studentId", "==", studentId)
        .get();
      if (feesSnap?.docs?.length) {
        for (const doc of feesSnap.docs) {
          const docPatch: Record<string, any> = { updatedAt: new Date().toISOString() };
          if (patchData.studentName) docPatch.studentName = patchData.studentName;
          if (patchData.rollNumber !== undefined) docPatch.rollNumber = Number(patchData.rollNumber) || patchData.rollNumber;
          if (patchData.classGrade) docPatch.classGrade = patchData.classGrade;
          if (typeof doc.ref?.update === "function") {
            await doc.ref.update(docPatch);
          }
        }
      }
    } catch (err) {
      logger.warn("[StudentService] Could not cascade fees update", { metadata: { studentId, err } });
    }

    // 2. Cascade to attendance
    try {
      const attSnap = await db.collection("attendance")
        .where("tenantId", "==", tenantId)
        .where("studentId", "==", studentId)
        .get();
      if (attSnap?.docs?.length) {
        for (const doc of attSnap.docs) {
          const docPatch: Record<string, any> = { updatedAt: new Date().toISOString() };
          if (patchData.studentName) docPatch.studentName = patchData.studentName;
          if (patchData.rollNumber !== undefined) docPatch.rollNumber = patchData.rollNumber;
          if (patchData.classGrade) docPatch.classGrade = patchData.classGrade;
          if (patchData.section) docPatch.section = patchData.section;
          if (typeof doc.ref?.update === "function") {
            await doc.ref.update(docPatch);
          }
        }
      }
    } catch (err) {
      logger.warn("[StudentService] Could not cascade attendance update", { metadata: { studentId, err } });
    }

    // 3. Cascade to marks
    try {
      const marksSnap = await db.collection("marks")
        .where("tenantId", "==", tenantId)
        .where("studentId", "==", studentId)
        .get();
      if (marksSnap?.docs?.length) {
        for (const doc of marksSnap.docs) {
          const docPatch: Record<string, any> = { updatedAt: new Date().toISOString() };
          if (patchData.studentName) docPatch.studentName = patchData.studentName;
          if (patchData.rollNumber !== undefined) docPatch.rollNumber = patchData.rollNumber;
          if (patchData.classGrade) docPatch.classGrade = patchData.classGrade;
          if (patchData.section) docPatch.section = patchData.section;
          if (typeof doc.ref?.update === "function") {
            await doc.ref.update(docPatch);
          }
        }
      }
    } catch (err) {
      logger.warn("[StudentService] Could not cascade marks update", { metadata: { studentId, err } });
    }

    // 4. Cascade to invoices
    try {
      const invSnap = await db.collection("invoices")
        .where("tenantId", "==", tenantId)
        .where("studentId", "==", studentId)
        .get();
      if (invSnap?.docs?.length) {
        for (const doc of invSnap.docs) {
          const docPatch: Record<string, any> = { updatedAt: new Date().toISOString() };
          if (patchData.studentName) docPatch.studentName = patchData.studentName;
          if (patchData.classGrade) docPatch.classGrade = patchData.classGrade;
          if (typeof doc.ref?.update === "function") {
            await doc.ref.update(docPatch);
          }
        }
      }
    } catch (err) {
      logger.warn("[StudentService] Could not cascade invoices update", { metadata: { studentId, err } });
    }
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

  async advancedFilter(tenantId: string, filter: import("@/types/student").StudentFilter): Promise<PaginatedResult<StudentEntity>> {
    const result = await this.repository.advancedFilter(tenantId, filter);
    return {
      ...result,
      data: result.data.map((doc: any) => StudentPersistenceMapper.fromFirestore(doc))
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

    const studentDoc = await this.repository.findById(studentId, tenantId);
    const studentData = {
      fullName: studentDoc?.fullName || studentDoc?.firstName || "",
      classGrade: studentDoc?.classGrade || "",
      section: studentDoc?.section || "",
      admissionNumber: studentDoc?.admissionNumber,
      rollNumber: studentDoc?.rollNumber,
    };

    await eventBus.publish(EVENTS.ADMISSION_APPROVED, {
      tenantId,
      studentId,
      studentData,
      approvedBy: userId,
      userId,
    }, tenantId);

    await eventBus.publish(EVENTS.STUDENT_ENROLLED, {
      tenantId,
      studentId,
      studentData,
      approvedBy: userId,
      userId,
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
      Promise.resolve(this.student360Sources.attendance.findByStudentId(tenantId, studentId)).catch((err) => {
        logger.warn("Student 360: Attendance fetch failed, defaulting to empty", { tenantId, studentId, error: err?.message });
        return [];
      }),
      Promise.resolve(this.student360Sources.fees.findByStudent(tenantId, studentId)).catch((err) => {
        logger.warn("Student 360: Fees fetch failed, defaulting to empty", { tenantId, studentId, error: err?.message });
        return [];
      }),
      Promise.resolve(this.student360Sources.marks.findByStudent(tenantId, studentId)).catch((err) => {
        logger.warn("Student 360: Marks fetch failed, defaulting to empty", { tenantId, studentId, error: err?.message });
        return [];
      }),
      Promise.resolve(this.student360Sources.behavior.findByStudent(studentId, tenantId)).catch((err) => {
        logger.warn("Student 360: Behavior fetch failed, defaulting to empty", { tenantId, studentId, error: err?.message });
        return [];
      }),
      Promise.resolve(this.getTimeline(tenantId, studentId)).catch((err) => {
        logger.warn("Student 360: Timeline fetch failed, defaulting to empty", { tenantId, studentId, error: err?.message });
        return [];
      }),
    ]);

    const safeAttendance = Array.isArray(attendanceRecords) ? attendanceRecords : [];
    const safeFees = Array.isArray(feeRecords) ? feeRecords : [];
    const safeMarks = Array.isArray(marks) ? marks : [];
    const safeBehavior = Array.isArray(behaviorLogs) ? behaviorLogs : [];
    const safeTimeline = Array.isArray(timeline) ? timeline : [];

    const present = safeAttendance.filter((record) => record && (record.status === "Present" || record.status === "Late")).length;
    const absent = safeAttendance.filter((record) => record && record.status === "Absent").length;
    const late = safeAttendance.filter((record) => record && record.status === "Late").length;
    const attendancePercentage = safeAttendance.length > 0
      ? Math.round((present / safeAttendance.length) * 100)
      : 0;

    const feeAmount = (fee: any) => Number(fee?.amountPaid ?? fee?.amount ?? fee?.totalAmount) || 0;
    const totalDue = safeFees.reduce((sum, fee) => sum + feeAmount(fee), 0);
    const totalPaid = safeFees
      .filter((fee) => typeof fee?.status === "string" && fee.status.trim().toLowerCase() === "paid")
      .reduce((sum, fee) => sum + (Number(fee?.amountPaid) || 0), 0);

    const markPercentages = safeMarks.map((mark) => {
      if (!mark) return 0;
      const supplied = Number(mark.percentage);
      if (Number.isFinite(supplied)) return supplied;
      const total = Number(mark.totalMarks) || 0;
      return total > 0 ? ((Number(mark.marksObtained) || 0) / total) * 100 : 0;
    });
    const markAverage = markPercentages.length > 0
      ? Math.round(markPercentages.reduce((sum, percentage) => sum + percentage, 0) / markPercentages.length)
      : 0;

    const incidents = safeBehavior.filter((log) => log && Number(log.points) < 0).length;

    return {
      student: {
        ...student,
        id: student.studentId || student.id!,
      },
      attendance: { present, absent, late, percentage: attendancePercentage, records: safeAttendance },
      fees: { totalDue, totalPaid, outstanding: Math.max(0, totalDue - totalPaid), records: safeFees },
      marks: { exams: safeMarks, average: markAverage, trend: "stable", records: safeMarks },
      behavior: { logs: safeBehavior, incidents },
      transport: null,
      hostel: null,
      timeline: safeTimeline,
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
    if (!studentIds || studentIds.length === 0) {
      return { success: true, promoted: 0, errors: [] as string[] };
    }
    const errors: string[] = [];
    const existing = await this.repository.batchFindByIds(tenantId, studentIds);
    const existingMap = new Map<string, any>(existing.map((s: any) => [s.id, s]));

    const validIds: string[] = [];
    for (const id of studentIds) {
      const student = existingMap.get(id);
      if (!student || (student as any).tenantId !== tenantId) {
        errors.push(`Student ${id} not found or unauthorized for tenant`);
      } else {
        validIds.push(id);
      }
    }

    if (validIds.length > 0) {
      await this.repository.bulkUpdate(tenantId, validIds, {
        classGrade: newClass,
        section: newSection,
        ...(academicYear ? { academicYear } : {}),
        updatedAt: new Date().toISOString() as any,
        updatedBy: userId,
      });

      await eventBus.publish(EVENTS.STUDENT_PROMOTED, {
        tenantId,
        studentIds: validIds,
        newClass,
        newClassGrade: newClass,
        newSection,
        academicYear,
        promotedBy: userId,
        userId,
      }, tenantId);
    }

    return { success: errors.length === 0, promoted: validIds.length, errors };
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

  async checkSubscriptionLimit(
    tenantId: string,
    maxStudents: number,
    addingCount: number = 1
  ): Promise<void> {
    const currentCount = await this.count(tenantId);
    if (currentCount + addingCount > maxStudents) {
      throw new SubscriptionLimitException(
        `Student limit reached (${maxStudents}). Current: ${currentCount}, adding: ${addingCount}. Please upgrade your plan.`
      );
    }
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
