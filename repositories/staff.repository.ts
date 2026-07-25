// repositories/staff.repository.ts
import { BaseRepository } from "./base.repository";
import type { StaffDocument } from "@/documents/StaffDocument";
import type { StaffFilter, StaffAnalytics, StaffTimelineEntry } from "@/types/staff";
import type { IStaffRepository } from "@/interfaces/IStaffRepository";
import type { PaginatedResult } from "@/types/api";
import { RepositoryException } from "@/errors/AppError";

export class StaffRepository extends BaseRepository<StaffDocument> implements IStaffRepository {
  constructor() {
    super("staff");
  }

  async save(document: StaffDocument, tenantId: string): Promise<StaffDocument> {
    try {
      if (document.id) {
        await this.update(document.id, document, tenantId);
        const updated = await this.findById(document.id, tenantId);
        if (!updated) throw new Error("Staff not found after update.");
        return updated;
      } else {
        const newId = await this.create(document, tenantId);
        const created = await this.findById(newId, tenantId);
        if (!created) throw new Error("Staff not found after create.");
        return created;
      }
    } catch (error) {
      throw new RepositoryException("Failed to save staff", { tenantId, docId: document.id });
    }
  }

  async search(tenantId: string, query: string): Promise<(StaffDocument & { id: string })[]> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where("tenantId", "==", tenantId)
        .get();

      const lowerQuery = query.toLowerCase();
      return snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as StaffDocument & { id: string }))
        .filter(
          (staff) =>
            staff.fullName?.toLowerCase().includes(lowerQuery) ||
            staff.cnic?.includes(query) ||
            staff.mobile?.includes(query) ||
            staff.email?.toLowerCase().includes(lowerQuery) ||
            staff.employeeId?.includes(query) ||
            staff.designation?.toLowerCase().includes(lowerQuery) ||
            staff.department?.toLowerCase().includes(lowerQuery) ||
            staff.category?.toLowerCase().includes(lowerQuery)
        );
    } catch (error) {
      throw new RepositoryException("Failed to search staff", { query, tenantId });
    }
  }

  async findByEmail(tenantId: string, email: string): Promise<(StaffDocument & { id: string }) | null> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where("tenantId", "==", tenantId)
        .where("email", "==", email.toLowerCase())
        .limit(1)
        .get();

      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as StaffDocument & { id: string };
    } catch (error) {
      throw new RepositoryException("Failed to find staff by email", { email, tenantId });
    }
  }

  async findByEmployeeId(employeeId: string, tenantId: string): Promise<(StaffDocument & { id: string }) | null> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where("tenantId", "==", tenantId)
        .where("employeeId", "==", employeeId)
        .limit(1)
        .get();
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as StaffDocument & { id: string };
    } catch (error) {
      throw new RepositoryException("Failed to find staff by employee ID", { employeeId, tenantId });
    }
  }

  async findByCategory(category: string, tenantId: string): Promise<(StaffDocument & { id: string })[]> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where("tenantId", "==", tenantId)
        .where("category", "==", category)
        .get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as StaffDocument & { id: string }));
    } catch (error) {
      throw new RepositoryException("Failed to find staff by category", { category, tenantId });
    }
  }

  async findByDepartment(department: string, tenantId: string): Promise<(StaffDocument & { id: string })[]> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where("tenantId", "==", tenantId)
        .where("department", "==", department)
        .get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as StaffDocument & { id: string }));
    } catch (error) {
      throw new RepositoryException("Failed to find staff by department", { department, tenantId });
    }
  }

  async findByDesignation(designation: string, tenantId: string): Promise<(StaffDocument & { id: string })[]> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where("tenantId", "==", tenantId)
        .where("designation", "==", designation)
        .get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as StaffDocument & { id: string }));
    } catch (error) {
      throw new RepositoryException("Failed to find staff by designation", { designation, tenantId });
    }
  }

  async findByStatus(status: string, tenantId: string): Promise<(StaffDocument & { id: string })[]> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where("tenantId", "==", tenantId)
        .where("status", "==", status)
        .get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as StaffDocument & { id: string }));
    } catch (error) {
      throw new RepositoryException("Failed to find staff by status", { status, tenantId });
    }
  }

  async findByCampus(campus: string, tenantId: string): Promise<(StaffDocument & { id: string })[]> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where("tenantId", "==", tenantId)
        .where("campus", "==", campus)
        .get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as StaffDocument & { id: string }));
    } catch (error) {
      throw new RepositoryException("Failed to find staff by campus", { campus, tenantId });
    }
  }

  async findByRole(role: string, tenantId: string): Promise<(StaffDocument & { id: string })[]> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where("tenantId", "==", tenantId)
        .where("role", "==", role)
        .get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as StaffDocument & { id: string }));
    } catch (error) {
      throw new RepositoryException("Failed to find staff by role", { role, tenantId });
    }
  }

  async advancedFilter(tenantId: string, filter: StaffFilter): Promise<PaginatedResult<StaffDocument>> {
    try {
      let all = await this.findAll(tenantId);

      if (filter.search) {
        const q = filter.search.toLowerCase();
        all = all.filter(s =>
          s.fullName?.toLowerCase().includes(q) ||
          s.cnic?.includes(filter.search!) ||
          s.mobile?.includes(filter.search!) ||
          s.email?.toLowerCase().includes(q) ||
          s.employeeId?.includes(filter.search!) ||
          s.designation?.toLowerCase().includes(q) ||
          s.department?.toLowerCase().includes(q) ||
          s.category?.toLowerCase().includes(q)
        );
      }
      if (filter.category) all = all.filter(s => s.category === filter.category);
      if (filter.department) all = all.filter(s => s.department === filter.department);
      if (filter.designation) all = all.filter(s => s.designation === filter.designation);
      if (filter.status) all = all.filter(s => (s.status || "active") === filter.status);
      if (filter.campus) all = all.filter(s => s.campus === filter.campus);
      if (filter.gender) all = all.filter(s => s.gender === filter.gender);
      if (filter.employmentType) all = all.filter(s => s.employmentType === filter.employmentType);

      const total = all.length;

      const orderBy = filter.orderBy || "createdAt";
      const dir = filter.direction === "desc" ? -1 : 1;
      all.sort((a, b) => {
        const aVal = (a as unknown as Record<string, unknown>)[orderBy];
        const bVal = (b as unknown as Record<string, unknown>)[orderBy];
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === "number" && typeof bVal === "number") return (aVal - bVal) * dir;
        return String(aVal).localeCompare(String(bVal)) * dir;
      });

      const page = filter.page || 1;
      const limit = filter.limit || 20;
      const totalPages = Math.ceil(total / limit) || 1;
      const start = (page - 1) * limit;
      const data = all.slice(start, start + limit);

      return { data, total, page, totalPages };
    } catch (error) {
      throw new RepositoryException("Failed to advanced filter staff", { filter, tenantId });
    }
  }

  async bulkUpdate(tenantId: string, ids: string[], data: Partial<StaffDocument>): Promise<void> {
    if (ids.length === 0) return;
    try {
      const batch = this.db.batch();
      for (const id of ids) {
        const docRef = this.db.collection(this.collectionName).doc(id);
        const snap = await docRef.get();
        if (snap.exists && snap.data()?.tenantId === tenantId) {
          batch.update(docRef, { ...data, updatedAt: new Date().toISOString() });
        }
      }
      await batch.commit();
    } catch (error) {
      throw new RepositoryException("Failed to bulk update staff", { ids, tenantId });
    }
  }

  async bulkDelete(tenantId: string, ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    try {
      const batch = this.db.batch();
      for (const id of ids) {
        const docRef = this.db.collection(this.collectionName).doc(id);
        const snap = await docRef.get();
        if (snap.exists && snap.data()?.tenantId === tenantId) {
          batch.update(docRef, { deleted: true, deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: "archived" });
        }
      }
      await batch.commit();
    } catch (error) {
      throw new RepositoryException("Failed to bulk delete staff", { ids, tenantId });
    }
  }

  async archive(tenantId: string, id: string): Promise<void> {
    try {
      const docRef = this.db.collection(this.collectionName).doc(id);
      const snap = await docRef.get();
      if (!snap.exists || snap.data()?.tenantId !== tenantId) {
        throw new RepositoryException("Staff not found or unauthorized", { id, tenantId });
      }
      await docRef.update({ status: "archived", deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    } catch (error) {
      if (error instanceof RepositoryException) throw error;
      throw new RepositoryException("Failed to archive staff", { id, tenantId });
    }
  }

  async restore(tenantId: string, id: string): Promise<void> {
    try {
      const docRef = this.db.collection(this.collectionName).doc(id);
      const snap = await docRef.get();
      if (!snap.exists || snap.data()?.tenantId !== tenantId) {
        throw new RepositoryException("Staff not found or unauthorized", { id, tenantId });
      }
      await docRef.update({ status: "active", deletedAt: null, updatedAt: new Date().toISOString() });
    } catch (error) {
      if (error instanceof RepositoryException) throw error;
      throw new RepositoryException("Failed to restore staff", { id, tenantId });
    }
  }

  async staffAnalytics(tenantId: string): Promise<StaffAnalytics> {
    try {
      const all = await this.findAll(tenantId);

      const analytics: StaffAnalytics = {
        total: all.length,
        active: all.filter(s => (s.status || "active") === "active").length,
        terminated: all.filter(s => s.status === "terminated").length,
        resigned: all.filter(s => s.status === "resigned").length,
        onLeave: all.filter(s => s.status === "on-leave").length,
        byDepartment: {},
        byCategory: {},
        byCampus: {},
        byGender: {},
      };

      for (const s of all) {
        const dept = s.department || "Unassigned";
        analytics.byDepartment[dept] = (analytics.byDepartment[dept] || 0) + 1;

        const cat = s.category || "Other";
        analytics.byCategory[cat] = (analytics.byCategory[cat] || 0) + 1;

        const camp = s.campus || "Main";
        analytics.byCampus[camp] = (analytics.byCampus[camp] || 0) + 1;

        const gen = s.gender || "Unknown";
        analytics.byGender[gen] = (analytics.byGender[gen] || 0) + 1;
      }

      return analytics;
    } catch (error) {
      throw new RepositoryException("Failed to compute staff analytics", { tenantId });
    }
  }

  async timeline(tenantId: string, staffId: string): Promise<StaffTimelineEntry[]> {
    try {
      const staff = await this.findById(staffId, tenantId);
      if (!staff) return [];

      const entries: StaffTimelineEntry[] = [];

      if (staff.createdAt) {
        entries.push({
          date: typeof staff.createdAt === "object" && "toDate" in staff.createdAt
            ? new Date((staff.createdAt as { toDate: () => Date }).toDate()).toISOString()
            : String(staff.createdAt),
          type: "joining",
          title: "Joined Organization",
          description: `Started as ${staff.professional?.designation || "Staff"} in ${staff.professional?.department || "General"}`,
        });
      }

      if (staff.statusHistory) {
        for (const sh of staff.statusHistory) {
          entries.push({
            date: sh.changedAt,
            type: "status_change",
            title: `Status: ${sh.fromStatus} → ${sh.toStatus}`,
            description: sh.reason || "Status changed",
            metadata: { from: sh.fromStatus, to: sh.toStatus, changedBy: sh.changedBy },
          });
        }
      }

      if (staff.performance?.promotions) {
        for (const p of staff.performance.promotions) {
          entries.push({ date: "", type: "promotion", title: "Promoted", description: p });
        }
      }

      if (staff.performance?.achievements) {
        for (const a of staff.performance.achievements) {
          entries.push({ date: "", type: "achievement", title: "Achievement", description: a });
        }
      }

      if (staff.performance?.trainingHistory) {
        for (const t of staff.performance.trainingHistory) {
          entries.push({ date: "", type: "training", title: "Training Completed", description: t });
        }
      }

      entries.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      return entries;
    } catch (error) {
      throw new RepositoryException("Failed to build staff timeline", { tenantId, staffId });
    }
  }
}
