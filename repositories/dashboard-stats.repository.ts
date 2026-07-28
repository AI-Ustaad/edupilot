import { BaseRepository } from "./base.repository";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
import { IDashboardStatsRepository } from "@/interfaces/IDashboardStatsRepository";

export interface DashboardStats {
  id?: string;
  tenantId: string;
  totalStudents: number;
  totalStaff: number;
  totalClasses: number;
  totalRevenue: number;
  attendanceRate: number;
  lastUpdated: Date;
}

export class DashboardStatsRepository extends BaseRepository<DashboardStats> implements IDashboardStatsRepository {
  constructor() {
    super("dashboard_stats");
  }

  async findByTenant(tenantId: string): Promise<DashboardStats | null> {
    const doc = await this.db.collection(this.collectionName).doc(tenantId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as DashboardStats;
  }

  async updateStats(tenantId: string, data: Partial<DashboardStats>): Promise<void> {
    await this.db.collection(this.collectionName).doc(tenantId).set({
      ...data,
      lastUpdated: new Date(),
      updatedAt: dbTimestamp,
    }, { merge: true });
  }

  async incrementCounter(tenantId: string, counter: string, amount: number): Promise<void> {
    const docRef = this.db.collection(this.collectionName).doc(tenantId);
    await docRef.update({
      [counter]: FieldValue.increment(amount),
      lastUpdated: new Date(),
      updatedAt: dbTimestamp,
    });
  }
}
