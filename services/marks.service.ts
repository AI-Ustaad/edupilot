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
