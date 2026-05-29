// repositories/student.repository.ts
import { BaseRepository } from "./base.repository";
import { Student } from "@/types/student";

export class StudentRepository extends BaseRepository<Student> {

  constructor() {
    super("students");
  }

  // طالب علم کو رول نمبر سے تلاش کریں
  async findByRollNumber(
    rollNumber: number,
    tenantId: string
  ): Promise<Student | null> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .where("rollNumber", "==", rollNumber)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;                     // ← واپسی یقینی بنائی
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Student;
  }

  // کلاس کے تمام طلبہ
  async findByClass(
    className: string,
    tenantId: string
  ): Promise<Student[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .where("classGrade", "==", className)
      .orderBy("rollNumber", "asc")
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Student));
  }

  // کلاس + سیکشن کے طلبہ
  async findBySection(
    className: string,
    section: string,
    tenantId: string
  ): Promise<Student[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .where("classGrade", "==", className)
      .where("section", "==", section)
      .orderBy("rollNumber", "asc")
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Student));
  }
}
