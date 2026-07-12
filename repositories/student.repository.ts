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

  async findActiveStudents(
    tenantId: string
  ): Promise<(Student & { id: string })[]> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where("tenantId", "==", tenantId)
        .where("deleted", "==", false)
        .where("admissionStatus", "==", "approved")
        .orderBy("rollNumber", "asc")
        .get();

      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Student & { id: string })
      );
    } catch (error) {
      // Fallback: if composite index not yet deployed, fetch and filter in-memory
      const all = await this.findAll(tenantId);
      return all
        .filter((s) => !s.deleted && s.admissionStatus === "approved")
        .sort((a, b) => (a.rollNumber || 0) - (b.rollNumber || 0));
    }
  }

  async batchFindByIds(
    tenantId: string,
    ids: string[]
  ): Promise<(Student & { id: string })[]> {
    if (ids.length === 0) return [];
    try {
      const results: (Student & { id: string })[] = [];
      // Firestore `in` query supports max 30 items
      for (let i = 0; i < ids.length; i += 30) {
        const batch = ids.slice(i, i + 30);
        const snapshot = await this.db
          .collection(this.collectionName)
          .where("tenantId", "==", tenantId)
          .where("__name__", "in", batch)
          .get();
        snapshot.docs.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() } as Student & { id: string });
        });
      }
      return results;
    } catch (error) {
      throw new RepositoryException("Failed to batch find students", {
        tenantId,
        count: ids.length,
      });
    }
  }

  async countByClassAndSection(
    tenantId: string
  ): Promise<Record<string, Record<string, number>>> {
    try {
      const all = await this.findAll(tenantId);
      const map: Record<string, Record<string, number>> = {};
      for (const s of all) {
        if (s.deleted) continue;
        const cls = s.classGrade || "Unknown";
        const sec = s.section || "Unknown";
        if (!map[cls]) map[cls] = {};
        map[cls][sec] = (map[cls][sec] || 0) + 1;
      }
      return map;
    } catch (error) {
      throw new RepositoryException("Failed to count students by class and section", {
        tenantId,
      });
    }
  }
}
