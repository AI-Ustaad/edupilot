import { TenantRepository } from "@/repositories/tenant.repository";
import { TenantSetupRepository } from "@/repositories/tenant-setup.repository";
import { SectionRepository } from "@/repositories/section.repository";
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

  constructor() {
    this.tenantRepo = new TenantRepository();
    this.sectionRepo = new SectionRepository();
    this.setupRepo = new TenantSetupRepository();
  }

  async setupSchool(input: SchoolSetupInput): Promise<{ tenantId: string }> {
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
}
