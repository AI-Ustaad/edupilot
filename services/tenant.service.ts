import { TenantRepository } from "@/repositories/tenant.repository";
import { TenantSetupRepository } from "@/repositories/tenant-setup.repository";
import { SectionRepository } from "@/repositories/section.repository";
import { AcademicYearRepository } from "@/repositories/academic-year.repository";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";
import { logger } from "@/lib/logger/logger";
import type { ITenantService } from "@/interfaces/ITenantService";

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

  constructor() {
    this.tenantRepo = new TenantRepository();
    this.sectionRepo = new SectionRepository();
    this.setupRepo = new TenantSetupRepository();
    this.academicYearRepo = new AcademicYearRepository();
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
