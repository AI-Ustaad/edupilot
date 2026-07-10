// services/StaffService.ts
import { IStaffRepository } from "@/interfaces/IStaffRepository";
import { StaffRepository } from "@/repositories/staff.repository";
import { Staff } from "@/types/staff";
import { ValidationService } from "./ValidationService";
import { AuditService } from "./AuditService";
import { CreateStaffSchema, UpdateStaffSchema } from "@/validators/staff";
import {
  NotFoundException,
  BusinessError,
  ValidationError,
  SubscriptionLimitException,
} from "@/errors/AppError";
import { PaginatedResult } from "@/types/api";
import { logger } from "@/lib/logger/logger";

export class StaffService {
  private repository: IStaffRepository;
  private validation: ValidationService;
  private audit: AuditService;

  constructor(repository?: IStaffRepository) {
    this.repository = repository ?? new StaffRepository();
    this.validation = new ValidationService();
    this.audit = new AuditService();
  }

  async list(tenantId: string): Promise<(Staff & { id: string })[]> {
    return this.repository.findAll(tenantId);
  }

  async paginate(
    tenantId: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResult<Staff & { id: string }>> {
    return this.repository.paginate(tenantId, page, limit);
  }

  async getById(tenantId: string, id: string): Promise<Staff & { id: string }> {
    const staff = await this.repository.findById(id, tenantId);
    if (!staff) throw new NotFoundException("Staff member not found");
    return staff;
  }

  /**
   * Sanitize form payload: convert empty strings to undefined for optional fields.
   * Forms send "" for all empty inputs; Zod treats "" as a value (not undefined),
   * so optional fields with "" fail type-specific validators (email, url, enum, etc.)
   */
  private sanitizePayload(data: any): any {
    const clean = (obj: any): any => {
      if (obj === null || obj === undefined) return obj;
      if (Array.isArray(obj)) return obj.map(clean);
      if (typeof obj === "object" && !(obj instanceof Date)) {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (value === "") {
            cleaned[key] = undefined;
          } else if (typeof value === "object" && value !== null && !(value instanceof Date)) {
            cleaned[key] = clean(value);
          } else {
            cleaned[key] = value;
          }
        }
        return cleaned;
      }
      return obj;
    };
    return clean(data);
  }

  async create(
    data: any,
    tenantId: string,
    userId: string
  ): Promise<string> {
    // Sanitize payload: convert empty strings to undefined before validation
    const sanitized = this.sanitizePayload(data);

    const validation = this.validation.validate(CreateStaffSchema, sanitized);
    if (!validation.success) {
      logger.warn("[StaffService] Validation failed", {
        metadata: { errors: validation.errors, payload: sanitized },
      });
      throw new ValidationError("Validation failed", validation.errors);
    }

    // Check for duplicate email
    if (validation.data?.contact?.email) {
      const existing = await this.repository.findByEmail(tenantId, validation.data.contact.email);
      if (existing) {
        throw new BusinessError("A staff member with this email already exists");
      }
    }

    const docData = {
      ...validation.data,
      tenantId,
      createdBy: userId,
      admissionMethod: sanitized.admissionMethod || "manual",
    };

    const id = await this.repository.create(docData as any, tenantId);

    logger.info("[StaffService] Staff created", {
      metadata: { staffId: id, tenantId, userId, fullName: validation.data?.personal?.fullName },
    });

    await this.audit.log({
      action: "staff.created",
      userId,
      tenantId,
      entityId: id,
      entityType: "staff",
      metadata: { fullName: validation.data?.personal?.fullName },
    });

    return id;
  }

  async update(
    tenantId: string,
    id: string,
    data: any,
    userId?: string
  ): Promise<void> {
    // Verify existence
    await this.getById(tenantId, id);

    // Sanitize payload: convert empty strings to undefined before validation
    const sanitized = this.sanitizePayload(data);

    const validation = this.validation.validate(UpdateStaffSchema, sanitized);
    if (!validation.success) {
      logger.warn("[StaffService] Update validation failed", {
        metadata: { errors: validation.errors, staffId: id, tenantId },
      });
      throw new ValidationError("Validation failed", validation.errors);
    }

    await this.repository.update(id, validation.data as any, tenantId);

    await this.audit.log({
      action: "staff.updated",
      userId: userId || "system",
      tenantId,
      entityId: id,
      entityType: "staff",
      metadata: { updatedFields: Object.keys(data) },
    });
  }

  async delete(tenantId: string, id: string, userId?: string): Promise<void> {
    const staff = await this.getById(tenantId, id);
    await this.repository.softDelete(id, tenantId);

    await this.audit.log({
      action: "staff.deleted",
      userId: userId || "system",
      tenantId,
      entityId: id,
      entityType: "staff",
      metadata: { fullName: staff.personal?.fullName },
    });
  }

  async count(tenantId: string): Promise<number> {
    return this.repository.count(tenantId);
  }

  async exists(id: string, tenantId: string): Promise<boolean> {
    return this.repository.exists(id, tenantId);
  }

  async search(tenantId: string, query: string): Promise<(Staff & { id: string })[]> {
    return this.repository.search(tenantId, query);
  }

  async checkSubscriptionLimit(
    tenantId: string,
    maxStaff: number
  ): Promise<void> {
    const currentCount = await this.count(tenantId);
    if (currentCount >= maxStaff) {
      throw new SubscriptionLimitException(
        `Staff limit reached (${maxStaff}). Please upgrade your plan.`
      );
    }
  }
}
