import type { Bus } from "@/types/bus";

export interface IBusRepository {
  findAll(tenantId: string): Promise<(Bus & { id: string })[]>;
  findById(id: string, tenantId: string): Promise<(Bus & { id: string }) | null>;
  create(data: Omit<Bus, "id" | "createdAt" | "updatedAt">, tenantId: string): Promise<string>;
  update(id: string, data: Partial<Bus>, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
}
