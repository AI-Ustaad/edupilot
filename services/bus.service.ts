// services/bus.service.ts
import { BusRepository } from "@/repositories/bus.repository";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";
import { invalidateCache } from "@/lib/cache";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";
import { z } from "zod";
import type { IBusRepository } from "@/interfaces/IBusRepository";
import type { Bus } from "@/types/bus";

const createBusSchema = z.object({
  busNumber: z.string().min(1, "Bus number is required"),
  route: z.string().min(1, "Route is required"),
  driverName: z.string().optional(),
  driverContact: z.string().optional(),
  capacity: z.number().positive().optional(),
});

const updateBusSchema = createBusSchema.partial();

export class BusService {
  private audit: AuditService;
  private validation: ValidationService;

  constructor(private repo: IBusRepository = new BusRepository()) {
    this.audit = new AuditService();
    this.validation = new ValidationService();
  }

  async create(data: unknown, tenantId: string, userId?: string): Promise<Bus> {
    const parsed = this.validation.validateOrThrow(createBusSchema, data);

    const createData = { ...parsed, tenantId } as Omit<Bus, "id" | "createdAt" | "updatedAt">;
    const id = await this.repo.create(createData, tenantId);
    const bus = await this.repo.findById(id, tenantId);
    if (!bus) throw new Error("Bus created but could not be retrieved");

    await invalidateCache(`buses:${tenantId}`);

    if (userId) {
      await this.audit.log({
        action: "bus.created",
        userId,
        tenantId,
        entityId: id,
        entityType: "bus",
        metadata: { busNumber: parsed.busNumber, route: parsed.route },
      });
    }

    await eventBus.publish(EVENTS.BUS_CREATED, {
      tenantId,
      busId: id,
      busNumber: parsed.busNumber,
      route: parsed.route,
      createdBy: userId,
    }, tenantId);

    return bus as Bus;
  }

  async getAll(tenantId: string): Promise<Bus[]> {
    return (await this.repo.findAll(tenantId)) as Bus[];
  }

  async getById(id: string, tenantId: string): Promise<Bus | null> {
    return this.repo.findById(id, tenantId);
  }

  async update(id: string, data: unknown, tenantId: string, userId?: string): Promise<Bus> {
    const parsed = this.validation.validateOrThrow(updateBusSchema, data);

    await this.repo.update(id, parsed, tenantId);
    const updated = await this.repo.findById(id, tenantId);
    if (!updated) throw new Error("Bus not found after update");

    await invalidateCache(`buses:${tenantId}`);

    if (userId) {
      await this.audit.log({
        action: "bus.updated",
        userId,
        tenantId,
        entityId: id,
        entityType: "bus",
        metadata: { updates: parsed },
      });
    }

    await eventBus.publish(EVENTS.BUS_UPDATED, {
      tenantId,
      busId: id,
      updates: parsed,
      updatedBy: userId,
    }, tenantId);

    return updated as Bus;
  }

  async delete(id: string, tenantId: string, userId?: string): Promise<void> {
    const bus = await this.repo.findById(id, tenantId);
    await this.repo.delete(id, tenantId);

    await invalidateCache(`buses:${tenantId}`);

    if (userId) {
      await this.audit.log({
        action: "bus.deleted",
        userId,
        tenantId,
        entityId: id,
        entityType: "bus",
        metadata: { busNumber: (bus as any)?.busNumber },
      });
    }

    await eventBus.publish(EVENTS.BUS_DELETED, {
      tenantId,
      busId: id,
      deletedBy: userId,
    }, tenantId);
  }
}
