// services/staff.service.ts

import { BaseService } from "./base.service";
import { StaffRepository } from "@/repositories/staff.repository";
import { Staff } from "@/types/staff";
import {
  createStaffSchema,
  updateSchema,
} from "@/lib/validation";
import { ZodError } from "zod";

export class StaffService extends BaseService {
  private repository: StaffRepository;

  constructor(repository?: StaffRepository) {
    super();
    this.repository = repository ?? new StaffRepository();
  }

  // =====================================================
  // Modern Methods
  // =====================================================

  async list(tenantId: string) {
    return this.repository.findAll(tenantId);
  }

  async getById(tenantId: string, id: string) {
    const staff = await this.repository.findById(id, tenantId);

    if (!staff) {
      throw new Error("Staff member not found");
    }

    return staff;
  }

  async create(tenantId: string, data: any) {
    try {
      const validated = createStaffSchema.parse(data);

      return await this.repository.create(
        validated as Omit<Staff, "id" | "createdAt" | "updatedAt">,
        tenantId
      );
    } catch (err) {
      if (err instanceof ZodError) {
        throw new Error(
          "Validation failed: " +
            err.errors.map((e) => e.message).join(", ")
        );
      }

      throw err;
    }
  }

  async update(
    tenantId: string,
    id: string,
    data: any
  ) {
    try {
      const validated = updateSchema.parse(data);

      await this.repository.update(
        id,
        validated as Partial<Staff>,
        tenantId
      );

      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        throw new Error(
          "Validation failed: " +
            err.errors.map((e) => e.message).join(", ")
        );
      }

      throw err;
    }
  }

  async delete(
    tenantId: string,
    id: string
  ) {
    await this.repository.delete(id, tenantId);

    return true;
  }

  async bulkCreate(
    tenantId: string,
    staffList: any[]
  ) {
    const results = [];

    for (const staffData of staffList) {
      try {
        const validated = createStaffSchema.parse(staffData);

        const created = await this.repository.create(
          validated as Omit<Staff, "id" | "createdAt" | "updatedAt">,
          tenantId
        );

        results.push({
          success: true,
          data: created,
        });
      } catch (err) {
        results.push({
          success: false,
          error:
            err instanceof ZodError
              ? err.errors.map((e) => e.message).join(", ")
              : "Unknown error",
          input: staffData,
        });
      }
    }

    return results;
  }

  // =====================================================
  // Legacy Compatibility Layer
  // =====================================================

  async listStaff(
    tenantId: string,
    page = 1,
    limit = 20
  ) {
    return this.repository.paginate(
      tenantId,
      page,
      limit
    );
  }

  async countStaff(
    tenantId: string
  ) {
    return this.repository.count(tenantId);
  }

  async getStaffById(
    id: string,
    tenantId: string
  ) {
    return this.getById(tenantId, id);
  }

  async createStaff(
    data: any,
    tenantId: string,
    _userId?: string
  ) {
    return this.create(tenantId, data);
  }

  async updateStaff(
    id: string,
    data: any,
    tenantId: string,
    _userId?: string
  ) {
    return this.update(
      tenantId,
      id,
      data
    );
  }

  async deleteStaff(
    id: string,
    tenantId: string
  ) {
    return this.delete(
      tenantId,
      id
    );
  }
}