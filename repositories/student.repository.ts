// repositories/student.repository.ts
import { BaseRepository } from "./base.repository";
import { Student } from "@/types/student";
import { IStudentRepository } from "@/interfaces/IStudentRepository";
import { PaginatedResult } from "@/types/api";
import { RepositoryException } from "@/errors/AppError";

export class StudentRepository
  extends BaseRepository<Student>
  implements IStudentRepository
{
  constructor() {
    super("students");
  }

  async findByRollNumber(
    rollNumber: number,
    tenantId: string
  ): Promise<(Student & { id: string }) | null> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where("tenantId", "==", tenantId)
        .where("rollNumber", "==", rollNumber)
        .limit(1)
        .get();

      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Student & { id: string };
    } catch (error) {
      throw new RepositoryException("Failed to find student by roll number", {
        rollNumber,
        tenantId,
      });
    }
  }

  async findByClass(
    className: string,
    tenantId: string
  ): Promise<(Student & { id: string })[]> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where("tenantId", "==", tenantId)
        .where("classGrade", "==", className)
        .orderBy("rollNumber", "asc")
        .get();

      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Student & { id: string }
      );
    } catch (error) {
      throw new RepositoryException("Failed to find students by class", {
        className,
        tenantId,
      });
    }
  }

  async findBySection(
    className: string,
    section: string,
    tenantId: string
  ): Promise<(Student & { id: string })[]> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where("tenantId", "==", tenantId)
        .where("classGrade", "==", className)
        .where("section", "==", section)
        .orderBy("rollNumber", "asc")
        .get();

      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Student & { id: string }
      );
    } catch (error) {
      throw new RepositoryException("Failed to find students by section", {
        className,
        section,
        tenantId,
      });
    }
  }

  async search(
    tenantId: string,
    query: string
  ): Promise<(Student & { id: string })[]> {
    try {
      const all = await this.findAll(tenantId);
      const lowerQuery = query.toLowerCase();
      return all.filter(
        (s) =>
          s.fullName?.toLowerCase().includes(lowerQuery) ||
          s.fatherName?.toLowerCase().includes(lowerQuery) ||
          String(s.rollNumber).includes(query) ||
          s.cnic?.includes(query) ||
          s.phone?.includes(query) ||
          s.email?.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      throw new RepositoryException("Failed to search students", {
        query,
        tenantId,
      });
    }
  }

  async countByClass(
    tenantId: string
  ): Promise<Record<string, number>> {
    try {
      const all = await this.findAll(tenantId);
      const countMap: Record<string, number> = {};
      for (const s of all) {
        const cls = s.classGrade || "Unknown";
        countMap[cls] = (countMap[cls] || 0) + 1;
      }
      return countMap;
    } catch (error) {
      throw new RepositoryException("Failed to count students by class", {
        tenantId,
      });
    }
  }
}
