// services/analytics.service.ts
import { StudentRepository } from "@/repositories/student.repository";
import { StaffRepository } from "@/repositories/staff.repository";
import { FeesService } from "@/services/fees.service";
import { TenantRepository } from "@/repositories/tenant.repository";
import type { IAnalyticsService, TenantAnalytics } from "@/interfaces/IAnalyticsService";

export class AnalyticsService implements IAnalyticsService {
  private studentRepo: StudentRepository;
  private staffRepo: StaffRepository;
  private feesService: FeesService;
  private tenantRepo: TenantRepository;

  constructor() {
    this.studentRepo = new StudentRepository();
    this.staffRepo = new StaffRepository();
    this.feesService = new FeesService();
    this.tenantRepo = new TenantRepository();
  }

  async getTenantAnalytics(tenantId: string): Promise<TenantAnalytics> {
    const [students, staff, revenue] = await Promise.all([
      this.studentRepo.count(tenantId),
      this.staffRepo.count(tenantId),
      this.feesService.getTotalRevenue(tenantId),
    ]);

    const tenant = await this.tenantRepo.findById(tenantId, tenantId);
    const name = tenant?.name || tenantId;

    return {
      tenantId,
      name,
      students,
      staff,
      revenue,
    };
  }

  async getAllTenantsAnalytics(): Promise<TenantAnalytics[]> {
    const tenants = await this.tenantRepo.findAll("all");

    const analytics = await Promise.all(
      tenants.map(async (tenant) => {
        const tid = tenant.id;
        const [students, staff, revenue] = await Promise.all([
          this.studentRepo.count(tid),
          this.staffRepo.count(tid),
          this.feesService.getTotalRevenue(tid),
        ]);
        return {
          tenantId: tid,
          name: tenant.name || tid,
          students,
          staff,
          revenue,
        };
      })
    );

    return analytics;
  }
}
