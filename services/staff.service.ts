// services/staff.service.ts
// FIXED: constructor اب repository کو parameter کے طور پر بھی قبول کرتا ہے
// تاکہ new StaffService() اور new StaffService(new StaffRepository()) دونوں کام کریں

import { BaseService } from "./base.service";
import { StaffRepository } from "@/repositories/staff.repository";
import { Staff } from "@/types/staff";
import {
  createStaffSchema,
  updateStaffSchema,
} from "@/lib/validation";
import { ZodError } from "zod";

export class StaffService extends BaseService {
  private repository: StaffRepository;

  // FIXED: repository optional parameter — دونوں طریقے کام کریں گے:
  // new StaffService()
  // new StaffService(new StaffRepository())
  constructor(repository?: StaffRepository) {
    super();
    this.repository = repository ?? new StaffRepository();
  }

  async list(tenantId: string) {
    return this.repository.findAll(tenantId);
  }

  async getStaffById(id: string, tenantId: string) {
    return this.repository.findById(tenantId, id);
  }

  // backward compatibility alias
  async getById(tenantId: string, id: string) {
    return this.repository.findById(tenantId, id);
  }

  async create(tenantId: string, data: any) {
    try {
      const validated = createStaffSchema.parse(data);
      return await this.repository.create(tenantId, validated as Partial<Staff>);
    } catch (err) {
      if (err instanceof ZodError) {
        throw new Error("Validation failed: " + err.errors.map(e => e.message).join(", "));
      }
      throw err;
    }
  }

  async update(tenantId: string, id: string, data: any) {
    try {
      const validated = updateStaffSchema.parse(data);
      return await this.repository.update(tenantId, id, validated as Partial<Staff>);
    } catch (err) {
      if (err instanceof ZodError) {
        throw new Error("Validation failed: " + err.errors.map(e => e.message).join(", "));
      }
      throw err;
    }
  }

  async delete(tenantId: string, id: string) {
    return this.repository.delete(tenantId, id);
  }

  async bulkCreate(tenantId: string, staffList: any[]) {
    const results = [];
    for (const staffData of staffList) {
      try {
        const validated = createStaffSchema.parse(staffData);
        const created = await this.repository.create(tenantId, validated as Partial<Staff>);
        results.push({ success: true, data: created });
      } catch (err) {
        results.push({
          success: false,
          error: err instanceof ZodError
            ? err.errors.map(e => e.message).join(", ")
            : "Unknown error",
          input: staffData,
        });
      }
    }
    return results;
  }
}
