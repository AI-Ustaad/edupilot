// services/addons.service.ts
import { AddonsRepository } from "@/repositories/addons.repository";
import type { IAddonsRepository } from "@/interfaces/IAddonsRepository";

export class AddonsService {
  private repository: IAddonsRepository;

  constructor(repository?: IAddonsRepository) {
    this.repository = repository ?? new AddonsRepository();
  }

  async getAddons(tenantId: string): Promise<any | null> {
    return this.repository.getAddons(tenantId);
  }

  async saveAddons(tenantId: string, addons: any): Promise<void> {
    return this.repository.saveAddons(tenantId, addons);
  }
}
