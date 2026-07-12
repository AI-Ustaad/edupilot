// services/marks.service.ts
import { MarksRepository } from "@/repositories/marks.repository";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";
import { SaveMarkSchema, SkillsSchema } from "@/validators/marks";
import { invalidateCache } from "@/lib/cache";
import { eventBus } from "@/lib/events/event-bus";
import { EVENTS } from "@/lib/events/event-types";
import type { IMarksRepository } from "@/interfaces/IMarksRepository";
import type { Mark } from "@/types/marks";

export class MarksService {
  private audit: AuditService;
  private validation: ValidationService;

  constructor(private repo: IMarksRepository = new MarksRepository()) {
    this.audit = new AuditService();
    this.validation = new ValidationService();
  }

  async saveMark(data: unknown, tenantId: string, userId: string): Promise<{ id: string; message: string }> {
    const parsed = this.validation.validateOrThrow(SaveMarkSchema, data);

    // Idempotency: deterministic document ID
    const markDocId = `${parsed.studentId}_${parsed.term.replace(/\s+/g, "")}_${parsed.subject.replace(/\s+/g, "")}`;

    await this.repo.upsert(markDocId, {
      ...parsed,
      deleted: false,
      createdBy: userId,
      updatedBy: userId,
    }, tenantId);

    await invalidateCache(`dashboard:${tenantId}`);
    await invalidateCache(`results:${tenantId}`);

    await this.audit.log({
      action: "mark.saved",
      userId,
      tenantId,
      entityId: markDocId,
      entityType: "mark",
      metadata: { studentId: parsed.studentId, subject: parsed.subject, term: parsed.term },
    });

    eventBus.publish(EVENTS.MARKS_ENTERED, {
      tenantId,
      markId: markDocId,
      studentId: parsed.studentId,
      subject: parsed.subject,
      term: parsed.term,
      marksObtained: parsed.marksObtained,
      totalMarks: parsed.totalMarks,
    });

    return { id: markDocId, message: "Mark saved successfully" };
  }

  async listMarks(tenantId: string, filters?: {
    classGrade?: string;
    section?: string;
    term?: string;
    subject?: string;
    studentId?: string;
  }): Promise<(Mark & { id: string })[]> {
    return this.repo.findWithFilters(tenantId, filters);
  }

  async deleteMark(id: string, tenantId: string, userId: string): Promise<void> {
    // Use repository soft delete instead of direct Firestore
    const mark = await this.repo.findById(id, tenantId);
    await this.repo.softDeleteMark(id, tenantId, userId);

    await invalidateCache(`dashboard:${tenantId}`);
    await invalidateCache(`results:${tenantId}`);

    await this.audit.log({
      action: "mark.deleted",
      userId,
      tenantId,
      entityId: id,
      entityType: "mark",
      metadata: { studentId: mark?.studentId, subject: mark?.subject, term: mark?.term },
    });
  }

  async saveSkills(data: unknown, tenantId: string, userId: string): Promise<void> {
    const parsed = this.validation.validateOrThrow(SkillsSchema, data);

    const existingMarks = await this.repo.findWithFilters(tenantId, {
      studentId: parsed.studentId,
      term: parsed.term,
      subject: parsed.subject,
    });

    if (existingMarks.length === 0) {
      await this.repo.create({
        studentId: parsed.studentId,
        term: parsed.term,
        subject: parsed.subject,
        skills: parsed.skills,
        classGrade: "",
        section: "",
        marksObtained: 0,
        totalMarks: 0,
        percentage: 0,
        grade: "",
        tenantId,
        createdBy: userId,
        updatedBy: userId,
        deleted: false,
      }, tenantId);
    } else {
      const markId = existingMarks[0].id;
      await this.repo.upsert(markId, {
        skills: parsed.skills,
        updatedBy: userId,
      }, tenantId);
    }

    await this.audit.log({
      action: "mark.skillsSaved",
      userId,
      tenantId,
      entityType: "mark",
      metadata: { studentId: parsed.studentId, subject: parsed.subject, term: parsed.term },
    });
  }

  async getSkills(tenantId: string, studentId: string, term?: string): Promise<Record<string, number>[]> {
    // Use repository method instead of direct Firestore
    return this.repo.findSkills(tenantId, studentId, term);
  }

  async getAggregatedResults(tenantId: string, classGrade: string, section: string, term: string): Promise<{
    studentId: string;
    studentName: string;
    rollNumber: string | number;
    marks: (Mark & { id: string })[];
    totalObtained: number;
    totalMax: number;
    percentage: string;
    grade: string;
  }[]> {
    // Fetch marks via repository
    const marks = await this.repo.findWithFilters(tenantId, { classGrade, section, term });

    // Group marks by student
    const marksByStudent = new Map<string, (Mark & { id: string })[]>();
    for (const mark of marks) {
      const list = marksByStudent.get(mark.studentId) || [];
      list.push(mark);
      marksByStudent.set(mark.studentId, list);
    }

    // Aggregate per student
    const results: {
      studentId: string;
      studentName: string;
      rollNumber: string | number;
      marks: (Mark & { id: string })[];
      totalObtained: number;
      totalMax: number;
      percentage: string;
      grade: string;
    }[] = [];

    for (const [studentId, studentMarks] of marksByStudent) {
      const totalObtained = studentMarks.reduce((sum, m) => sum + (Number(m.marksObtained) || 0), 0);
      const totalMax = studentMarks.reduce((sum, m) => sum + (Number(m.totalMarks) || 0), 0);
      const pct = totalMax > 0 ? ((totalObtained / totalMax) * 100) : 0;
      const percentage = pct.toFixed(2);

      let grade = "U";
      if (pct >= 90) grade = "A++";
      else if (pct >= 80) grade = "A+";
      else if (pct >= 70) grade = "A";
      else if (pct >= 60) grade = "B";
      else if (pct >= 50) grade = "C";
      else if (pct >= 40) grade = "D";

      results.push({
        studentId,
        studentName: studentMarks[0]?.studentName || "Unknown",
        rollNumber: "-",
        marks: studentMarks,
        totalObtained,
        totalMax,
        percentage,
        grade,
      });
    }

    // Sort by percentage descending (toppers first)
    results.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
    return results;
  }
}
// services/marks.service.ts
import { MarksRepository } from "@/repositories/marks.repository";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";
import { SaveMarkSchema, BulkPublishSchema, SkillsSchema } from "@/validators/marks";
import { invalidateCache } from "@/lib/cache";
import type { IMarksRepository } from "@/interfaces/IMarksRepository";
import type { Mark } from "@/types/marks";
import { FieldValue } from "firebase-admin/firestore";

export class MarksService {
  private audit: AuditService;
  private validation: ValidationService;

  constructor(private repo: IMarksRepository = new MarksRepository()) {
    this.audit = new AuditService();
    this.validation = new ValidationService();
  }

  async saveMark(data: unknown, tenantId: string, userId: string): Promise<{ id: string; message: string }> {
    const validation = this.validation.validate(SaveMarkSchema, data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors?.map(e => e.message).join(", ")}`);
    }
    const parsed = validation.data;

    // Idempotency: deterministic document ID
    const markDocId = `${parsed.studentId}_${parsed.term.replace(/\s+/g, "")}_${parsed.subject.replace(/\s+/g, "")}`;

    await this.repo.upsert(markDocId, {
      ...parsed,
      tenantId,
      deleted: false,
      createdAt: FieldValue.serverTimestamp() as any,
      createdBy: userId,
      updatedAt: FieldValue.serverTimestamp() as any,
      updatedBy: userId,
    }, tenantId);

    await invalidateCache(`dashboard:${tenantId}`);

    await this.audit.log({
      action: "mark.saved",
      userId,
      tenantId,
      entityId: markDocId,
      entityType: "mark",
      metadata: { studentId: parsed.studentId, subject: parsed.subject, term: parsed.term },
    });

    return { id: markDocId, message: "Mark saved successfully" };
  }

  async listMarks(tenantId: string, filters?: {
    classGrade?: string;
    section?: string;
    term?: string;
    subject?: string;
    studentId?: string;
  }): Promise<Mark[]> {
    return this.repo.findWithFilters(tenantId, filters);
  }

  async deleteMark(id: string, tenantId: string, userId: string): Promise<void> {
    const docRef = (this.repo as any).db.collection("marks").doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists || docSnap.data()?.tenantId !== tenantId) {
      throw new Error("Mark not found or access denied");
    }

    await docRef.update({
      deleted: true,
      deletedAt: FieldValue.serverTimestamp(),
      deletedBy: userId,
    });

    await invalidateCache(`dashboard:${tenantId}`);

    await this.audit.log({
      action: "mark.deleted",
      userId,
      tenantId,
      entityId: id,
      entityType: "mark",
      metadata: { studentId: docSnap.data()?.studentId, subject: docSnap.data()?.subject, term: docSnap.data()?.term },
    });
  }

  async saveSkills(data: unknown, tenantId: string, userId: string): Promise<void> {
    const validation = this.validation.validate(SkillsSchema, data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors?.map(e => e.message).join(", ")}`);
    }
    const parsed = validation.data;

    const existingMarks = await this.repo.findWithFilters(tenantId, {
      studentId: parsed.studentId,
      term: parsed.term,
      subject: parsed.subject,
    });

    const existingMarksList = existingMarks as (Mark & { id: string })[];
    if (existingMarksList.length === 0) {
      await this.repo.create({
        studentId: parsed.studentId,
        term: parsed.term,
        subject: parsed.subject,
        skills: parsed.skills,
        classGrade: "",
        section: "",
        marksObtained: 0,
        totalMarks: 0,
        percentage: 0,
        grade: "",
        tenantId,
        createdBy: userId,
        updatedBy: userId,
      }, tenantId);
    } else {
      const markId = existingMarksList[0].id;
      await this.repo.upsert(markId, {
        skills: parsed.skills,
        updatedBy: userId,
        updatedAt: FieldValue.serverTimestamp() as any,
      }, tenantId);
    }

    await this.audit.log({
      action: "mark.skillsSaved",
      userId,
      tenantId,
      entityType: "mark",
      metadata: { studentId: parsed.studentId, subject: parsed.subject, term: parsed.term },
    });
  }

  async getSkills(tenantId: string, studentId: string, term?: string): Promise<any[]> {
    let query: FirebaseFirestore.Query = (this.repo as any).db
      .collection("marks")
      .where("studentId", "==", studentId)
      .where("tenantId", "==", tenantId);

    if (term) {
      query = query.where("term", "==", term);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(d => d.data().skills).filter(Boolean);
  }
}
