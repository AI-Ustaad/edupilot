// interfaces/IBusService.ts
import type { Bus } from "@/types/bus";

export interface IBusService {
  create(data: unknown, tenantId: string, userId?: string): Promise<Bus>;
  getAll(tenantId: string): Promise<Bus[]>;
  getById(id: string, tenantId: string): Promise<Bus | null>;
  update(id: string, data: unknown, tenantId: string, userId?: string): Promise<Bus>;
  delete(id: string, tenantId: string, userId?: string): Promise<void>;
}
