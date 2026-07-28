// services/ledger.service.ts
import { LedgerRepository } from "@/repositories/ledger.repository";
import type { ILedgerRepository } from "@/interfaces/ILedgerRepository";
import type { LedgerEntry } from "@/repositories/ledger.repository";

export class LedgerService {
  private repository: ILedgerRepository;

  constructor(repository?: ILedgerRepository) {
    this.repository = repository ?? new LedgerRepository();
  }

  async findByTenant(tenantId: string): Promise<(LedgerEntry & { id: string })[]> {
    return this.repository.findByTenant(tenantId);
  }

  async createEntry(data: Omit<LedgerEntry, "id" | "createdAt">, tenantId: string): Promise<string> {
    return this.repository.createEntry(data, tenantId);
  }
}
