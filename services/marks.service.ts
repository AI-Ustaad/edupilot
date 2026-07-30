// services/marks.service.ts
import { MarksRepository } from "@/repositories/marks.repository";
import { StudentRepository } from "@/repositories/student.repository";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";
import { SaveMarkSchema, BulkPublishSchema, SkillsSchema } from "@/validators/marks";
import { invalidateCache } from "@/lib/cache";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";
import { sendEmail } from "@/lib/email";
import { logger } from "@/lib/logger/logger";
import type { IMarksRepository } from "@/interfaces/IMarksRepository";
import type { Mark } from "@/types/marks";
import type { IMarksService } from "@/interfaces/IMarksService";

export class MarksService implements IMarksService {
  private audit: AuditService;
  private validation: ValidationService;

  constructor(private repo: IMarksRepository = new MarksRepository()) {
    this.audit = new AuditService();
    this.validation = new ValidationService();
  }

  async saveMark(data: unknown, tenantId: string, userId: string): Promise<{ id: string; message: string }> {
    const parsed = this.validation.validateOrThrow(SaveMarkSchema, data);
    const markDocId = `${parsed.studentId}_${parsed.term.replace(/\s+/g, "")}_${parsed.subject.replace(/\s+/g, "")}`;

    await this.repo.upsert(markDocId, { ...parsed, deleted: false, createdBy: userId, updatedBy: userId }, tenantId);
    await invalidateCache(`dashboard:${tenantId}`);
    await invalidateCache(`results:${tenantId}`);

    await this.audit.log({ action: "mark.saved", userId, tenantId, entityId: markDocId, entityType: "mark", metadata: { studentId: parsed.studentId, subject: parsed.subject, term: parsed.term } });
    await eventBus.publish(EVENTS.MARKS_ENTERED, { tenantId, markId: markDocId, studentId: parsed.studentId, subject: parsed.subject, term: parsed.term, marksObtained: parsed.marksObtained, totalMarks: parsed.totalMarks }, tenantId);

    return { id: markDocId, message: "Mark saved successfully" };
  }

  async listMarks(tenantId: string, filters?: { classGrade?: string; section?: string; term?: string; subject?: string; studentId?: string }): Promise<(Mark & { id: string })[]> {
    return this.repo.findWithFilters(tenantId, filters);
  }

  async findByStudent(tenantId: string, studentId: string): Promise<(Mark & { id: string })[]> {
    return this.repo.findByStudent(tenantId, studentId);
  }

  async deleteMark(id: string, tenantId: string, userId: string): Promise<void> {
    const mark = await this.repo.findById(id, tenantId);
    await this.repo.softDeleteMark(id, tenantId, userId);
    await invalidateCache(`dashboard:${tenantId}`);
    await invalidateCache(`results:${tenantId}`);
    await this.audit.log({ action: "mark.deleted", userId, tenantId, entityId: id, entityType: "mark", metadata: { studentId: mark?.studentId, subject: mark?.subject, term: mark?.term } });
    await eventBus.publish(EVENTS.MARKS_DELETED, { tenantId, markId: id, studentId: mark?.studentId, subject: mark?.subject, term: mark?.term, deletedBy: userId }, tenantId);
  }

  async saveSkills(data: unknown, tenantId: string, userId: string): Promise<void> {
    const parsed = this.validation.validateOrThrow(SkillsSchema, data);
    const existingMarks = await this.repo.findWithFilters(tenantId, { studentId: parsed.studentId, term: parsed.term, subject: parsed.subject });

    if (existingMarks.length === 0) {
      await this.repo.create({ studentId: parsed.studentId, term: parsed.term, subject: parsed.subject, skills: parsed.skills, classGrade: "", section: "", marksObtained: 0, totalMarks: 0, percentage: 0, grade: "", tenantId, createdBy: userId, updatedBy: userId, deleted: false }, tenantId);
    } else {
      await this.repo.upsert(existingMarks[0].id, { skills: parsed.skills, updatedBy: userId }, tenantId);
    }
    await this.audit.log({ action: "mark.skillsSaved", userId, tenantId, entityType: "mark", metadata: { studentId: parsed.studentId, subject: parsed.subject, term: parsed.term } });
  }

  async getSkills(tenantId: string, studentId: string, term?: string): Promise<Record<string, number>[]> {
    return this.repo.findSkills(tenantId, studentId, term);
  }

  async getAggregatedResults(tenantId: string, classGrade: string, section: string, term: string): Promise<{ studentId: string; studentName: string; rollNumber: string | number; marks: (Mark & { id: string })[]; totalObtained: number; totalMax: number; percentage: string; grade: string }[]> {
    const marks = await this.repo.findWithFilters(tenantId, { classGrade, section, term });
    const marksByStudent = new Map<string, (Mark & { id: string })[]>();
    for (const mark of marks) { const list = marksByStudent.get(mark.studentId) || []; list.push(mark); marksByStudent.set(mark.studentId, list); }

    const results: { studentId: string; studentName: string; rollNumber: string | number; marks: (Mark & { id: string })[]; totalObtained: number; totalMax: number; percentage: string; grade: string }[] = [];
    for (const [studentId, studentMarks] of marksByStudent) {
      const totalObtained = studentMarks.reduce((sum, m) => sum + (Number(m.marksObtained) || 0), 0);
      const totalMax = studentMarks.reduce((sum, m) => sum + (Number(m.totalMarks) || 0), 0);
      const pct = totalMax > 0 ? ((totalObtained / totalMax) * 100) : 0;
      const percentage = pct.toFixed(2);
      let grade = "U";
      if (pct >= 90) grade = "A++"; else if (pct >= 80) grade = "A+"; else if (pct >= 70) grade = "A"; else if (pct >= 60) grade = "B"; else if (pct >= 50) grade = "C"; else if (pct >= 40) grade = "D";
      results.push({ studentId, studentName: studentMarks[0]?.studentName || "Unknown", rollNumber: "-", marks: studentMarks, totalObtained, totalMax, percentage, grade });
    }
    results.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
    return results;
  }

  async publishResults(data: unknown, tenantId: string, userId: string): Promise<{ students: number; emailsSent: number }> {
    const parsed = this.validation.validateOrThrow(BulkPublishSchema, data);
    const marks = await this.repo.findWithFilters(tenantId, { classGrade: parsed.classGrade, section: parsed.section, term: parsed.term });
    const studentIds = [...new Set((marks as any[]).map(m => m.studentId))] as string[];
    if (studentIds.length === 0) return { students: 0, emailsSent: 0 };

    const studentRepo = new StudentRepository();
    const allStudents = await studentRepo.batchFindByIds(tenantId, studentIds);

    const parentEmails = allStudents
      .filter((s: any) => s.parentEmail || s.parent_email)
      .map((s: any) => ({ email: (s.parentEmail || s.parent_email)!, studentName: s.fullName || s.name || "Your child" }));

    await Promise.all(parentEmails.map(p => sendEmail(p.email, `Exam Results Published - ${parsed.term}`, `<p>Dear Parent,</p><p>Results for <strong>${p.studentName}</strong> in <strong>${parsed.term}</strong> are now available.</p>`).catch(err => logger.error("Failed to send results email:", { metadata: { error: err } }))));

    await invalidateCache(`results:${tenantId}`);
    await invalidateCache(`dashboard:${tenantId}`);

    await eventBus.publish(EVENTS.RESULT_PUBLISHED, { tenantId, classGrade: parsed.classGrade, section: parsed.section, term: parsed.term, studentCount: studentIds.length, publishedBy: userId }, tenantId);
    await this.audit.log({ action: "result.published", userId, tenantId, entityType: "result", metadata: { classGrade: parsed.classGrade, section: parsed.section, term: parsed.term, studentCount: studentIds.length } });

    return { students: studentIds.length, emailsSent: parentEmails.length };
  }
}
