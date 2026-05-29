import { BaseRepository } from "./base.repository";
import { Student } from "@/types/student";

export class StudentRepository extends BaseRepository<Student> {
  constructor() {
    super("students");
  }

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

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];

    return {
      id: doc.id,
      ...doc.data(),
    } as Student;
  }

  async findByClass(
    className: string,
    tenantId: string
  ): Promise<Student[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .where("classGrade", "==", className)
      .orderBy("rollNumber")
      .get();

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Student
    );
  }

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
      .orderBy("rollNumber")
      .get();

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Student
    );
  }

  async paginate(
    tenantId: string,
    page = 1,
    limit = 20
  ) {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .get();

    const all = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Student
    );

    const start = (page - 1) * limit;

    return {
      data: all.slice(start, start + limit),
      total: all.length,
      page,
      limit,
    };
  }
}
