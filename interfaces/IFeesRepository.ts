// interfaces/IFeesRepository.ts
import { Fee } from "@/types/fees";

export interface IFeesRepository {
  findAll(tenantId: string): Promise<(Fee & { id: string })[]>;
  findById(id: string, tenantId: string): Promise<(Fee & { id: string }) | null>;
  create(data: Omit<Fee, "id" | "createdAt" | "updatedAt">, tenantId: string): Promise<string>;
  update(id: string, data: Partial<Fee>, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
  count(tenantId: string): Promise<number>;
  exists(id: string, tenantId: string): Promise<boolean>;
}
