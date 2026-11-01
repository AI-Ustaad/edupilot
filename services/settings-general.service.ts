// services/settings-general.service.ts
import { SettingsRepository } from "@/repositories/settings.repository";
import { ConfigurationRepository } from "@/repositories/configuration.repository";
import { ConfigurationCacheService } from "@/services/configuration-cache.service";
import type { ISettingsRepository } from "@/interfaces/ISettingsRepository";

export class SettingsGeneralService {
  private repository: ISettingsRepository;
  private configRepo: ConfigurationRepository;
  private cache: ConfigurationCacheService;

  constructor(
    repository?: ISettingsRepository,
    configRepo?: ConfigurationRepository,
    cache?: ConfigurationCacheService
  ) {
    this.repository = repository ?? new SettingsRepository();
    this.configRepo = configRepo ?? new ConfigurationRepository();
    this.cache = cache ?? new ConfigurationCacheService();
  }

  async getGeneral(tenantId: string): Promise<Record<string, any> | null> {
    const legacy = await this.repository.getGeneral(tenantId);
    const master = await this.configRepo.getConfiguration(tenantId);

    if (!master && !legacy) {
      return null;
    }

    if (!master) {
      return legacy;
    }

    // Merge master configuration with legacy settings, letting master take precedence for core fields
    return {
      ...(legacy || {}),
      schoolName: master.school?.name || legacy?.schoolName || "",
      schoolType: master.school?.type || legacy?.schoolType || "Private",
      affiliation: master.school?.boardName || legacy?.affiliation || "",
      country: master.school?.country || legacy?.country || "PK",
      levels: master.academic?.levels || legacy?.levels || [],
      classes: master.academic?.classes || legacy?.classes || [],
      subjects: master.academic?.subjects || legacy?.subjects || [],
      defaultSections: master.academic?.sectionNames || legacy?.defaultSections || ["A"],
    };
  }

  async updateGeneral(tenantId: string, data: Record<string, any>): Promise<void> {
    // 1. Dual-write to legacy settings/general for backward compatibility
    await this.repository.updateGeneral(tenantId, data);

    // 2. Propagate updates to MasterSchoolConfiguration in configurations collection
    const master = await this.configRepo.getConfiguration(tenantId);
    if (master) {
      if (data.schoolName !== undefined) master.school.name = data.schoolName;
      if (data.schoolType !== undefined) master.school.type = data.schoolType;
      if (data.affiliation !== undefined) master.school.boardName = data.affiliation;
      if (data.country !== undefined) master.school.country = data.country;
      if (data.classes && Array.isArray(data.classes)) master.academic.classes = data.classes;
      if (data.subjects && Array.isArray(data.subjects)) master.academic.subjects = data.subjects;
      if (data.levels && Array.isArray(data.levels)) master.academic.levels = data.levels;
      if (data.defaultSections && Array.isArray(data.defaultSections)) {
        master.academic.sectionNames = data.defaultSections;
      }

      master.metadata.lastModified = new Date().toISOString();
      await this.configRepo.saveConfiguration(tenantId, master);
    }

    // 3. Invalidate configuration cache so all modules immediately see new config
    await this.cache.invalidateConfiguration(tenantId);
  }
}
