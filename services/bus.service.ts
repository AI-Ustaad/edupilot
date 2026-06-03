import { BusRepository } from "@/repositories/bus.repository";
import { Bus } from "@/types/bus";
import { ZodError } from "zod";
import { z } from "zod";

const createBusSchema = z.object({
  busNumber: z.string().min(1, "Bus number is required"),
  route: z.string().min(1, "Route is required"),
  driverName: z.string().optional(),
  driverContact: z.string().optional(),
  capacity: z.number().positive().optional(),
});

const updateBusSchema = createBusSchema.partial();

export class BusService {
  constructor(private repo: BusRepository) {}

  async create(data: unknown, tenantId: string): Promise<Bus> {
    let validated;
    try {
      validated = createBusSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }

    const id = await this.repo.create({ ...validated, tenantId } as any, tenantId);
    const record = await this.repo.findById(id, tenantId);
    return record as Bus;
  }

  async getAll(tenantId: string): Promise<Bus[]> {
    return (await this.repo.findAll(tenantId)) as Bus[];
  }

  async getById(id: string, tenantId: string): Promise<Bus | null> {
    return this.repo.findById(id, tenantId);
  }

  async update(id: string, data: unknown, tenantId: string): Promise<Bus> {
    let validated;
    try {
      validated = updateBusSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }

    await this.repo.update(id, validated, tenantId);
    const updated = await this.repo.findById(id, tenantId);
    if (!updated) throw new Error("Bus not found after update");
    return updated as Bus;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete(id, tenantId);
  }
}
