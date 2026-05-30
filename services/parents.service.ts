// services/parents.service.ts
import { ParentsRepository } from "@/repositories/parents.repository";
import { StudentRepository } from "@/repositories/student.repository";
import { Student } from "@/types/student";
import { Parent } from "@/types/parents";

export class ParentsService {
  constructor(
    private parentRepo: ParentsRepository,
    private studentRepo: StudentRepository
  ) {}

  /**
   * والدین کی دستاویز حاصل کریں
   */
  async getParent(userId: string, tenantId: string): Promise<Parent | null> {
    return this.parentRepo.findById(userId, tenantId);
  }

  /**
   * والدین کے بچوں کی فہرست (Student[])
   */
  async getChildren(userId: string, tenantId: string): Promise<Student[]> {
    const parent = await this.parentRepo.findById(userId, tenantId);
    if (!parent || !parent.studentIds || parent.studentIds.length === 0) {
      return [];
    }

    // طلبہ کی ریپوزٹری سے ایک ایک کر کے معلومات لانا
    const children: Student[] = [];
    for (const studentId of parent.studentIds) {
      const student = await this.studentRepo.findById(studentId, tenantId);
      if (student) {
        children.push(student as Student);
      }
    }
    return children;
  }

  /**
   * بچوں کی IDs حاصل کریں (اگر صرف IDs چاہیے)
   */
  async getChildIds(userId: string, tenantId: string): Promise<string[]> {
    const parent = await this.parentRepo.findById(userId, tenantId);
    return parent?.studentIds || [];
  }

  /**
   * چیک کریں کہ آیا یہ والدین فلاں طالب علم کا والد ہے
   */
  async isParentOf(userId: string, studentId: string, tenantId: string): Promise<boolean> {
    const parent = await this.parentRepo.findById(userId, tenantId);
    return parent?.studentIds?.includes(studentId) ?? false;
  }
}
