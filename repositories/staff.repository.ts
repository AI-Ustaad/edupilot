// repositories/staff.repository.ts
import { BaseRepository } from "./base.repository";
import { Staff, StaffFilter, StaffAnalytics, StaffTimelineEntry } from "@/types/staff";
import { IStaffRepository } from "@/interfaces/IStaffRepository";
import { PaginatedResult } from "@/types/api";
import { RepositoryException } from "@/errors/AppError";
import { adminDb, dbTimestamp } from "@/lib/firebase-admin";

export class StaffRepository extends BaseRepository<Staff> implements IStaffRepository {
  constructor() {
    super("staff");
  }

  async search(tenantId: string, query: string): Promise<(Staff & { id: string })[]> {
    try {
      const snapshot = await adminDb
        .collection("staff")
        .where("tenantId", "==", tenantId)
        .get();

      const lowerQuery = query.toLowerCase();
      return snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Staff & { id: string }))
        .filter(
          (staff) =>
            staff.personal?.fullName?.toLowerCase().includes(lowerQuery) ||
            staff.personal?.cnic?.includes(query) ||
            staff.contact?.mobile?.includes(query) ||
            staff.contact?.email?.toLowerCase().includes(lowerQuery) ||
            staff.professional?.personnelNo?.includes(query) ||
            staff.professional?.employeeId?.includes(query) ||
            staff.professional?.designation?.toLowerCase().includes(lowerQuery) ||
            staff.professional?.department?.toLowerCase().includes(lowerQuery) ||
            staff.category?.toLowerCase().includes(lowerQuery)
        );
    } catch (error) {
      throw new RepositoryException("Failed to search staff", { query, tenantId });
    }
  }

  async findByEmail(tenantId: string, email: string): Promise<(Staff & { id: string }) | null> {
    try {
      const snapshot = await adminDb
        .collection("staff")
        .where("tenantId", "==", tenantId)
        .where("contact.email", "==", email.toLowerCase())
        .limit(1)
        .get();

      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Staff & { id: string };
    } catch (error) {
      throw new RepositoryException("Failed to find staff by email", { email, tenantId });
    }
  }

  // ─── Enterprise Methods ──────────────────────────────────────────────────────

  async findByEmployeeId(employeeId: string, tenantId: string): Promise<(Staff & { id: string }) | null> {
    try {
      const snapshot = await adminDb
        .collection("staff")
        .where("tenantId", "==", tenantId)
        .where("professional.employeeId", "==", employeeId)
        .limit(1)
        .get();
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Staff & { id: string };
    } catch (error) {
      throw new RepositoryException("Failed to find staff by employee ID", { employeeId, tenantId });
    }
  }

  async findByCategory(category: string, tenantId: string): Promise<(Staff & { id: string })[]> {
    try {
      const snapshot = await adminDb
        .collection("staff")
        .where("tenantId", "==", tenantId)
        .where("category", "==", category)
        .get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Staff & { id: string }));
    } catch (error) {
      throw new RepositoryException("Failed to find staff by category", { category, tenantId });
    }
  }

  async findByDepartment(department: string, tenantId: string): Promise<(Staff & { id: string })[]> {
    try {
      const snapshot = await adminDb
        .collection("staff")
        .where("tenantId", "==", tenantId)
        .where("professional.department", "==", department)
        .get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Staff & { id: string }));
    } catch (error) {
      throw new RepositoryException("Failed to find staff by department", { department, tenantId });
    }
  }

  async findByDesignation(designation: string, tenantId: string): Promise<(Staff & { id: string })[]> {
    try {
      const snapshot = await adminDb
        .collection("staff")
        .where("tenantId", "==", tenantId)
        .where("professional.designation", "==", designation)
        .get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Staff & { id: string }));
    } catch (error) {
      throw new RepositoryException("Failed to find staff by designation", { designation, tenantId });
    }
  }

  async findByStatus(status: string, tenantId: string): Promise<(Staff & { id: string })[]> {
    try {
      const snapshot = await adminDb
        .collection("staff")
        .where("tenantId", "==", tenantId)
        .where("status", "==", status)
        .get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Staff & { id: string }));
    } catch (error) {
      throw new RepositoryException("Failed to find staff by status", { status, tenantId });
    }
  }

  async findByCampus(campus: string, tenantId: string): Promise<(Staff & { id: string })[]> {
    try {
      const snapshot = await adminDb
        .collection("staff")
        .where("tenantId", "==", tenantId)
        .where("campus", "==", campus)
        .get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Staff & { id: string }));
    } catch (error) {
      throw new RepositoryException("Failed to find staff by campus", { campus, tenantId });
    }
  }

  async findByRole(role: string, tenantId: string): Promise<(Staff & { id: string })[]> {
    try {
      const snapshot = await adminDb
        .collection("staff")
        .where("tenantId", "==", tenantId)
        .where("professional.role", "==", role)
        .get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Staff & { id: string }));
    } catch (error) {
      throw new RepositoryException("Failed to find staff by role", { role, tenantId });
    }
  }

  async advancedFilter(tenantId: string, filter: StaffFilter): Promise<{ data: (Staff & { id: string })[]; total: number; page: number; totalPages: number }> {
    try {
      const snapshot = await adminDb
        .collection("staff")
        .where("tenantId", "==", tenantId)
        .get();

      let results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Staff & { id: string }));

      // Apply filters
      if (filter.search) {
        const q = filter.search.toLowerCase();
        results = results.filter(s =>
          s.personal?.fullName?.toLowerCase().includes(q) ||
          s.personal?.cnic?.includes(filter.search!) ||
          s.contact?.mobile?.includes(filter.search!) ||
          s.contact?.email?.toLowerCase().includes(q) ||
          s.professional?.personnelNo?.includes(filter.search!) ||
          s.professional?.employeeId?.includes(filter.search!) ||
          s.professional?.designation?.toLowerCase().includes(q) ||
          s.professional?.department?.toLowerCase().includes(q) ||
          s.category?.toLowerCase().includes(q)
        );
      }
      if (filter.category) results = results.filter(s => s.category === filter.category);
      if (filter.department) results = results.filter(s => s.professional?.department === filter.department);
      if (filter.designation) results = results.filter(s => s.professional?.designation === filter.designation);
      if (filter.status) results = results.filter(s => (s.status || "active") === filter.status);
      if (filter.campus) results = results.filter(s => s.campus === filter.campus);
      if (filter.gender) results = results.filter(s => s.personal?.gender === filter.gender);
      if (filter.employmentType) results = results.filter(s => s.professional?.employmentType === filter.employmentType);

      const total = results.length;

      // Sort
      const orderBy = filter.orderBy || "createdAt";
      const dir = filter.direction === "desc" ? -1 : 1;
      results.sort((a, b) => {
        const aVal = (a as any)[orderBy];
        const bVal = (b as any)[orderBy];
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === "number" && typeof bVal === "number") return (aVal - bVal) * dir;
        return String(aVal).localeCompare(String(bVal)) * dir;
      });

      // Paginate
      const page = filter.page || 1;
      const limit = filter.limit || 20;
      const totalPages = Math.ceil(total / limit) || 1;
      const start = (page - 1) * limit;
      const data = results.slice(start, start + limit);

      return { data, total, page, totalPages };
    } catch (error) {
      throw new RepositoryException("Failed to advanced filter staff", { filter, tenantId });
    }
  }

  async bulkUpdate(tenantId: string, ids: string[], data: Partial<Staff>): Promise<void> {
    try {
      const batch = adminDb.batch();
      for (const id of ids) {
        const ref = adminDb.collection("staff").doc(id);
        const snap = await ref.get();
        if (snap.exists && snap.data()?.tenantId === tenantId) {
          batch.update(ref, { ...data, updatedAt: dbTimestamp } as any);
        }
      }
      await batch.commit();
    } catch (error) {
      throw new RepositoryException("Failed to bulk update staff", { ids, tenantId });
    }
  }

  async bulkDelete(tenantId: string, ids: string[]): Promise<void> {
    try {
      const batch = adminDb.batch();
      for (const id of ids) {
        const ref = adminDb.collection("staff").doc(id);
        const snap = await ref.get();
        if (snap.exists && snap.data()?.tenantId === tenantId) {
          batch.update(ref, { deletedAt: dbTimestamp, updatedAt: dbTimestamp, status: "archived" } as any);
        }
      }
      await batch.commit();
    } catch (error) {
      throw new RepositoryException("Failed to bulk delete staff", { ids, tenantId });
    }
  }

  async archive(tenantId: string, id: string): Promise<void> {
    try {
      const ref = adminDb.collection("staff").doc(id);
      const snap = await ref.get();
      if (!snap.exists || snap.data()?.tenantId !== tenantId) {
        throw new RepositoryException("Staff not found or unauthorized", { id, tenantId });
      }
      await ref.update({ status: "archived", deletedAt: dbTimestamp, updatedAt: dbTimestamp } as any);
    } catch (error: any) {
      if (error instanceof RepositoryException) throw error;
      throw new RepositoryException("Failed to archive staff", { id, tenantId });
    }
  }

  async restore(tenantId: string, id: string): Promise<void> {
    try {
      const ref = adminDb.collection("staff").doc(id);
      const snap = await ref.get();
      if (!snap.exists || snap.data()?.tenantId !== tenantId) {
        throw new RepositoryException("Staff not found or unauthorized", { id, tenantId });
      }
      await ref.update({ status: "active", deletedAt: null, updatedAt: dbTimestamp } as any);
    } catch (error: any) {
      if (error instanceof RepositoryException) throw error;
      throw new RepositoryException("Failed to restore staff", { id, tenantId });
    }
  }

  async staffAnalytics(tenantId: string): Promise<StaffAnalytics> {
    try {
      const snapshot = await adminDb
        .collection("staff")
        .where("tenantId", "==", tenantId)
        .get();

      const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Staff & { id: string }));

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
        const dept = s.professional?.department || "Unassigned";
        analytics.byDepartment[dept] = (analytics.byDepartment[dept] || 0) + 1;

        const cat = s.category || "Other";
        analytics.byCategory[cat] = (analytics.byCategory[cat] || 0) + 1;

        const camp = s.campus || "Main";
        analytics.byCampus[camp] = (analytics.byCampus[camp] || 0) + 1;

        const gen = s.personal?.gender || "Unknown";
        analytics.byGender[gen] = (analytics.byGender[gen] || 0) + 1;
      }

      return analytics;
    } catch (error) {
      throw new RepositoryException("Failed to compute staff analytics", { tenantId });
    }
  }

  async timeline(tenantId: string, staffId: string): Promise<StaffTimelineEntry[]> {
    try {
      const ref = adminDb.collection("staff").doc(staffId);
      const snap = await ref.get();
      if (!snap.exists || snap.data()?.tenantId !== tenantId) {
        throw new RepositoryException("Staff not found", { staffId, tenantId });
      }
      const staff = { id: snap.id, ...snap.data() } as Staff & { id: string };
      const entries: StaffTimelineEntry[] = [];

      // Joining date
      if (staff.createdAt) {
        entries.push({
          date: typeof staff.createdAt === "object" && "toDate" in staff.createdAt
            ? (staff.createdAt as any).toDate().toISOString()
            : String(staff.createdAt),
          type: "joining",
          title: "Joined Organization",
          description: `Started as ${staff.professional?.designation || "Staff"} in ${staff.professional?.department || "General"}`,
        });
      }

      // Status history
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

      // Promotions
      if (staff.performance?.promotions) {
        for (const p of staff.performance.promotions) {
          entries.push({ date: "", type: "promotion", title: "Promoted", description: p });
        }
      }

      // Achievements
      if (staff.performance?.achievements) {
        for (const a of staff.performance.achievements) {
          entries.push({ date: "", type: "achievement", title: "Achievement", description: a });
        }
      }

      // Training
      if (staff.performance?.trainingHistory) {
        for (const t of staff.performance.trainingHistory) {
          entries.push({ date: "", type: "training", title: "Training Completed", description: t });
        }
      }

      // Sort by date (entries without dates go to end)
      entries.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      return entries;
    } catch (error: any) {
      if (error instanceof RepositoryException) throw error;
      throw new RepositoryException("Failed to build staff timeline", { staffId, tenantId });
    }
  }
}

