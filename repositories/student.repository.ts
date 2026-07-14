// repositories/student.repository.ts
import { BaseRepository } from "./base.repository";
import { Student, StudentFilter, StudentAnalytics, TimelineEntry } from "@/types/student";
import { IStudentRepository } from "@/interfaces/IStudentRepository";
import { PaginatedResult } from "@/types/api";
import { RepositoryException } from "@/errors/AppError";
import { dbTimestamp } from "@/lib/firebase-admin";

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

  // ─── Enterprise Methods ────────────────────────────────────────────────────

  async findByAdmissionNo(
    admissionNo: string,
    tenantId: string
  ): Promise<(Student & { id: string }) | null> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where("tenantId", "==", tenantId)
        .where("admissionNumber", "==", admissionNo)
        .limit(1)
        .get();
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Student & { id: string };
    } catch (error) {
      throw new RepositoryException("Failed to find student by admission no", { admissionNo, tenantId });
    }
  }

  async findByStatus(
    status: string,
    tenantId: string
  ): Promise<(Student & { id: string })[]> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where("tenantId", "==", tenantId)
        .where("status", "==", status)
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Student & { id: string });
    } catch (error) {
      throw new RepositoryException("Failed to find students by status", { status, tenantId });
    }
  }

  async findByHouse(
    house: string,
    tenantId: string
  ): Promise<(Student & { id: string })[]> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where("tenantId", "==", tenantId)
        .where("house", "==", house)
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Student & { id: string });
    } catch (error) {
      throw new RepositoryException("Failed to find students by house", { house, tenantId });
    }
  }

  async findByParent(
    parentId: string,
    tenantId: string
  ): Promise<(Student & { id: string })[]> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where("tenantId", "==", tenantId)
        .where("parentId", "==", parentId)
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Student & { id: string });
    } catch (error) {
      throw new RepositoryException("Failed to find students by parent", { parentId, tenantId });
    }
  }

  async findByTransport(
    transportRouteId: string,
    tenantId: string
  ): Promise<(Student & { id: string })[]> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where("tenantId", "==", tenantId)
        .where("transportRouteId", "==", transportRouteId)
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Student & { id: string });
    } catch (error) {
      throw new RepositoryException("Failed to find students by transport", { transportRouteId, tenantId });
    }
  }

  async findByHostel(
    hostelId: string,
    tenantId: string
  ): Promise<(Student & { id: string })[]> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where("tenantId", "==", tenantId)
        .where("hostelId", "==", hostelId)
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Student & { id: string });
    } catch (error) {
      throw new RepositoryException("Failed to find students by hostel", { hostelId, tenantId });
    }
  }

  async findGraduated(tenantId: string): Promise<(Student & { id: string })[]> {
    return this.findByStatus("graduated", tenantId);
  }

  async findTransferred(tenantId: string): Promise<(Student & { id: string })[]> {
    return this.findByStatus("transferred", tenantId);
  }

  async findDeleted(tenantId: string): Promise<(Student & { id: string })[]> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where("tenantId", "==", tenantId)
        .where("deleted", "==", true)
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Student & { id: string });
    } catch (error) {
      throw new RepositoryException("Failed to find deleted students", { tenantId });
    }
  }

  async advancedFilter(
    tenantId: string,
    filter: StudentFilter
  ): Promise<PaginatedResult<Student & { id: string }>> {
    try {
      let all = await this.findAll(tenantId);

      // Apply in-memory filters (Firestore doesn't support composite queries well)
      let filtered = all.filter(s => {
        if (filter.classGrade && s.classGrade !== filter.classGrade) return false;
        if (filter.section && s.section !== filter.section) return false;
        if (filter.gender && s.gender !== filter.gender) return false;
        if (filter.status && (s.status || "active") !== filter.status) return false;
        if (filter.house && s.house !== filter.house) return false;
        if (filter.academicYear && s.academicYear !== filter.academicYear) return false;
        if (filter.search) {
          const q = filter.search.toLowerCase();
          const matches =
            s.fullName?.toLowerCase().includes(q) ||
            s.fatherName?.toLowerCase().includes(q) ||
            String(s.rollNumber).includes(q) ||
            s.admissionNumber?.includes(q) ||
            s.phone?.includes(q) ||
            s.cnic?.includes(q) ||
            s.email?.toLowerCase().includes(q);
          if (!matches) return false;
        }
        return true;
      });

      // Sorting
      const orderBy = filter.orderBy || "rollNumber";
      const dir = filter.direction === "desc" ? -1 : 1;
      filtered.sort((a, b) => {
        const aVal = (a as any)[orderBy];
        const bVal = (b as any)[orderBy];
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === "number" && typeof bVal === "number") return (aVal - bVal) * dir;
        return String(aVal).localeCompare(String(bVal)) * dir;
      });

      // Pagination
      const total = filtered.length;
      const page = filter.page || 1;
      const limit = filter.limit || 20;
      const totalPages = Math.ceil(total / limit) || 1;
      const start = (page - 1) * limit;
      const data = filtered.slice(start, start + limit);

      return { data, total, page, totalPages };
    } catch (error) {
      throw new RepositoryException("Failed to advanced filter students", { tenantId, filter });
    }
  }

  async bulkUpdate(
    tenantId: string,
    ids: string[],
    data: Partial<Student>
  ): Promise<void> {
    if (ids.length === 0) return;
    try {
      const batch = this.db.batch();
      for (const id of ids) {
        const docRef = this.db.collection(this.collectionName).doc(id);
        batch.update(docRef, { ...data, updatedAt: dbTimestamp });
      }
      await batch.commit();
    } catch (error) {
      throw new RepositoryException("Failed to bulk update students", { tenantId, count: ids.length });
    }
  }

  async bulkDelete(tenantId: string, ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    try {
      const batch = this.db.batch();
      for (const id of ids) {
        const docRef = this.db.collection(this.collectionName).doc(id);
        batch.update(docRef, { deleted: true, deletedAt: dbTimestamp, updatedAt: dbTimestamp });
      }
      await batch.commit();
    } catch (error) {
      throw new RepositoryException("Failed to bulk delete students", { tenantId, count: ids.length });
    }
  }

  async archive(tenantId: string, id: string): Promise<void> {
    await this.update(id, { status: "archived" } as Partial<Student>, tenantId);
  }

  async restore(tenantId: string, id: string): Promise<void> {
    try {
      const docRef = this.db.collection(this.collectionName).doc(id);
      await docRef.update({
        status: "active",
        deleted: false,
        deletedAt: null,
        updatedAt: dbTimestamp,
      });
    } catch (error) {
      throw new RepositoryException("Failed to restore student", { tenantId, id });
    }
  }

  async studentAnalytics(tenantId: string): Promise<StudentAnalytics> {
    try {
      const all = await this.findAll(tenantId);
      const analytics: StudentAnalytics = {
        total: all.length,
        active: 0,
        graduated: 0,
        transferred: 0,
        suspended: 0,
        archived: 0,
        dropped: 0,
        byClass: {},
        bySection: {},
        byGender: {},
        byHouse: {},
        riskCount: 0,
      };

      for (const s of all) {
        const status = s.status || (s.deleted ? "archived" : "active");
        if (status === "active") analytics.active++;
        else if (status === "graduated") analytics.graduated++;
        else if (status === "transferred") analytics.transferred++;
        else if (status === "suspended") analytics.suspended++;
        else if (status === "archived") analytics.archived++;
        else if (status === "dropped") analytics.dropped++;

        const cls = s.classGrade || "Unknown";
        analytics.byClass[cls] = (analytics.byClass[cls] || 0) + 1;

        const sec = s.section || "Unknown";
        if (!analytics.bySection[cls]) analytics.bySection[cls] = {};
        analytics.bySection[cls][sec] = (analytics.bySection[cls][sec] || 0) + 1;

        const gender = s.gender || "Unknown";
        analytics.byGender[gender] = (analytics.byGender[gender] || 0) + 1;

        if (s.house) {
          analytics.byHouse[s.house] = (analytics.byHouse[s.house] || 0) + 1;
        }
      }

      return analytics;
    } catch (error) {
      throw new RepositoryException("Failed to compute student analytics", { tenantId });
    }
  }

  // 🟢 Helper Method for Date Parsing
  private toIsoDate(value: any): string | null {
    if (!value) return null;

    // Firestore Timestamp
    if (typeof value?.toDate === "function") {
      return value.toDate().toISOString();
    }

    // JS Date
    if (value instanceof Date) {
      return value.toISOString();
    }

    // ISO String
    if (typeof value === "string") {
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d.toISOString();
    }

    return null;
  }

  async timeline(tenantId: string, studentId: string): Promise<TimelineEntry[]> {
    try {
      const student = await this.findById(studentId, tenantId);
      if (!student) return [];

      const entries: TimelineEntry[] = [];

      // Admission entry
      const created = this.toIsoDate(student.createdAt);
      if (created) {
        entries.push({
          date: created,
          type: "admission",
          title: "Student Admitted",
          description: `Admitted to class ${student.classGrade} section ${student.section}`,
          metadata: { admissionNumber: student.admissionNumber },
        });
      }

      // Promotion entries
      if (student.promotionHistory) {
        for (const promo of student.promotionHistory) {
          const promoDate = this.toIsoDate(promo.promotedAt);
          if (promoDate) {
            entries.push({
              date: promoDate,
              type: "promotion",
              title: "Promoted",
              description: `Promoted from ${promo.fromClass}-${promo.fromSection} to ${promo.toClass}-${promo.toSection}`,
              metadata: { academicYear: promo.academicYear },
            });
          }
        }
      }

      // Graduation entry
      const promoted = this.toIsoDate(student.promotedAt);
      if (student.status === "graduated" && promoted) {
        entries.push({
          date: promoted,
          type: "graduation",
          title: "Graduated",
          description: `Student graduated from class ${student.classGrade}`,
        });
      }

      // Transfer entry
      const updated = this.toIsoDate(student.updatedAt);
      if (student.status === "transferred" && updated) {
        entries.push({
          date: updated,
          type: "transfer",
          title: "Transferred",
          description: "Student transferred to another institution",
        });
      }

      // Sort by date descending
      entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return entries;
    } catch (error) {
      throw new RepositoryException("Failed to build student timeline", { tenantId, studentId, originalError: error });
    }
  }
}
