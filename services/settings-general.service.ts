// services/settings-general.service.ts
import { SettingsRepository } from "@/repositories/settings.repository";
import type { ISettingsRepository } from "@/interfaces/ISettingsRepository";

export class SettingsGeneralService {
  private repository: ISettingsRepository;

  constructor(repository?: ISettingsRepository) {
    this.repository = repository ?? new SettingsRepository();
  }

  async getGeneral(tenantId: string): Promise<Record<string, any> | null> {
    return this.repository.getGeneral(tenantId);
  }

  async updateGeneral(tenantId: string, data: Record<string, any>): Promise<void> {
    return this.repository.updateGeneral(tenantId, data);
  }
}
