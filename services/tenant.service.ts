// services/tenant.service.ts
import { TenantRepository } from "@/repositories/tenant.repository";
import { TenantSetupRepository } from "@/repositories/tenant-setup.repository";
import { SectionRepository } from "@/repositories/section.repository";
import { AcademicYearRepository } from "@/repositories/academic-year.repository";
import { ConfigurationRepository } from "@/repositories/configuration.repository";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";
import { logger } from "@/lib/logger/logger";
import type { ITenantService, TenantRepairResult } from "@/interfaces/ITenantService";

export interface SchoolSetupInput {
  schoolName: string;
  type?: string;
  curriculum?: string;
  classes: any[];
  subjects: string[];
  userId: string;
}

export class TenantService implements ITenantService {
  private tenantRepo: TenantRepository;
  private sectionRepo: SectionRepository;
  private setupRepo: TenantSetupRepository;
  private academicYearRepo: AcademicYearRepository;
  private configRepo: ConfigurationRepository;

  constructor() {
    this.tenantRepo = new TenantRepository();
    this.sectionRepo = new SectionRepository();
    this.setupRepo = new TenantSetupRepository();
    this.academicYearRepo = new AcademicYearRepository();
    this.configRepo = new ConfigurationRepository();
  }

  async setupSchool(input: SchoolSetupInput): Promise<{ tenantId: string; academicYearId?: string }> {
    const { schoolName, type, curriculum, classes, subjects, userId } = input;
    const tenantId = userId.startsWith("tenant_") ? userId : `tenant_${userId}`;

    await this.setupRepo.setupSchool({
      userId,
      tenantId,
      schoolName,
      type,
      curriculum,
      classes,
      subjects,
    });

    eventBus.publish(EVENTS.SCHOOL_SETUP_COMPLETED, {
      tenantId,
      schoolName,
      classesCount: classes.length,
      subjectsCount: subjects.length,
      createdBy: userId,
    }, tenantId);

    return { tenantId };
  }

  /**
   * 🔁 Tenant Repair / Provisioning
   * - اگر ماسٹر ٹیننٹ موجود ہو تو کچھ نہیں کرتا
   * - اگر نہ ہو لیکن یوزر منسلک ہو اور کنفیگریشن موجود ہو تو بحال کرتا ہے
   */
  async provisionOrRepairTenant(tenantId: string, userId: string): Promise<TenantRepairResult> {
    // 1. کیا ٹیننٹ پہلے سے موجود ہے؟
    const exists = await this.tenantRepo.verifyTenantExists(tenantId);
    if (exists) {
      return { repaired: false, reason: "tenant_already_exists" };
    }

    // 2. کیا یوزر واقعی اسی ٹیننٹ سے منسلک ہے؟
    const userAssociated = await this.tenantRepo.verifyUserTenantAssociation(userId, tenantId);
    if (!userAssociated) {
      logger.warn("TENANT_REPAIR_REJECTED_USER_NOT_ASSOCIATED", { tenantId, userId });
      return { repaired: false, reason: "user_not_associated" };
    }

    // 3. کیا کنفیگریشن موجود ہے؟
    const config = await this.configRepo.getConfiguration(tenantId);
    if (!config) {
      logger.warn("TENANT_REPAIR_REJECTED_CONFIG_MISSING", { tenantId, userId });
      return { repaired: false, reason: "config_missing" };
    }

    // 4. کیا کنفیگریشن درست ہے؟
    if (!config.school?.name || !config.school?.curriculumId || !config.school?.type) {
      logger.warn("TENANT_REPAIR_REJECTED_CONFIG_MALFORMED", { tenantId, userId });
      return { repaired: false, reason: "config_malformed" };
    }

    // 5. بہترین ممکنہ تاریخ اور مالک نکالیں
    const bestCreatedAt =
      config.version?.createdAt ||
      config.metadata?.configuredAt ||
      config.metadata?.lastModified ||
      new Date().toISOString();

    const originalOwnerId =
      config.metadata?.configuredBy ||
      config.version?.createdBy;

    // 6. ٹیننٹ ماسٹر ڈاکیومنٹ بحال کریں
    await this.tenantRepo.restoreTenant(tenantId, {
      name: config.school.name,
      type: config.school.type,
      curriculum: config.school.curriculumId,
      ownerId: originalOwnerId,
      status: "active",
      createdAt: bestCreatedAt,
      updatedAt: new Date().toISOString(),
    });

    logger.info("TENANT_REPAIRED", { tenantId, userId, reason: "tenant_restored_from_configuration" });
    return { repaired: true, reason: "tenant_restored_from_configuration" };
  }

  async initializeAcademicYear(tenantId: string, userId: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    const ayId = await this.academicYearRepo.create({
      name: `${currentYear}-${currentYear + 1}`,
      startDate: `${currentYear}-04-01`,
      endDate: `${currentYear + 1}-03-31`,
      isCurrent: true,
      tenantId,
      createdBy: userId,
    }, tenantId);

    return ayId;
  }
}
