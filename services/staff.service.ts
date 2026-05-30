import { StaffRepository } from "@/repositories/staff.repository";
import { Staff } from "@/types/staff";
import {
  CreateStaffSchema,
  UpdateStaffSchema,
} from "@/lib/validation";
import { ZodError } from "zod";

export class StaffService {
  constructor(private repo: StaffRepository) {}

  async createStaff(data: unknown, tenantId: string, userId: string): Promise<Staff> {
    let validated;
    try {
      validated = CreateStaffSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }

    const createData = {
      ...validated,
      tenantId,
      createdBy: userId,
    } as Omit<Staff, "id" | "createdAt" | "updatedAt">;

    const id = await this.repo.create(createData, tenantId);
    const staff = await this.repo.findById(id, tenantId);
    if (!staff) throw new Error("Staff created but could not be retrieved");
    return staff as Staff;
  }

  async getStaffById(id: string, tenantId: string): Promise<Staff | null> {
    return this.repo.findById(id, tenantId);
  }

  async listStaff(tenantId: string, page = 1, limit = 20) {
    const allStaff = await this.repo.findAll(tenantId);
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      data: allStaff.slice(start, end),
      total: allStaff.length,
      page,
      limit,
      totalPages: Math.ceil(allStaff.length / limit),
    };
  }

  async updateStaff(id: string, data: unknown, tenantId: string, userId: string): Promise<Staff> {
    let validated;
    try {
      validated = UpdateStaffSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }

    await this.repo.update(id, { ...validated, updatedBy: userId } as any, tenantId);
    const updated = await this.repo.findById(id, tenantId);
    if (!updated) throw new Error("Staff not found after update");
    return updated as Staff;
  }

  async deleteStaff(id: string, tenantId: string): Promise<void> {
    await this.repo.softDelete(id, tenantId);
  }

  async hardDeleteStaff(id: string, tenantId: string): Promise<void> {
    await this.repo.delete(id, tenantId);
  }

  async countStaff(tenantId: string): Promise<number> {
    return this.repo.count(tenantId);
  }
}
