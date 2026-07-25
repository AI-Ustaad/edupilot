// services/analytics.service.ts
import { StudentRepository } from "@/repositories/student.repository";
import { StaffRepository } from "@/repositories/staff.repository";
import { FeesService } from "@/services/fees.service";
import type { IAnalyticsService, TenantAnalytics } from "@/interfaces/IAnalyticsService";
import { adminDb } from "@/lib/firebase-admin";

export class AnalyticsService implements IAnalyticsService {
  private studentRepo: StudentRepository;
  private staffRepo: StaffRepository;
  private feesService: FeesService;

  constructor() {
    this.studentRepo = new StudentRepository();
    this.staffRepo = new StaffRepository();
    this.feesService = new FeesService();
  }

  async getTenantAnalytics(tenantId: string): Promise<TenantAnalytics> {
    const [students, staff, revenue] = await Promise.all([
      this.studentRepo.count(tenantId),
      this.staffRepo.count(tenantId),
      this.feesService.getTotalRevenue(tenantId),
    ]);

    const tenantDoc = await adminDb.collection("tenants").doc(tenantId).get();
    const name = tenantDoc.exists ? (tenantDoc.data()?.name as string) || tenantId : tenantId;

    return {
      tenantId,
      name,
      students,
      staff,
      revenue,
    };
  }

  async getAllTenantsAnalytics(): Promise<TenantAnalytics[]> {
    const tenantsSnap = await adminDb.collection("tenants").get();

    const tenants = await Promise.all(
      tenantsSnap.docs.map(async (doc) => {
        const tid = doc.id;
        const [students, staff, revenue] = await Promise.all([
          this.studentRepo.count(tid),
          this.staffRepo.count(tid),
          this.feesService.getTotalRevenue(tid),
        ]);
        return {
          tenantId: tid,
          name: (doc.data() as Record<string, unknown>).name as string || tid,
          students,
          staff,
          revenue,
        };
      })
    );

    return tenants;
  }
}
