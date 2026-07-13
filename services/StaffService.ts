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
import { serializeForFirestore } from "@/lib/firestore/firestoreSerializer";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";

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
   * Also filters out incomplete/empty objects from arrays.
   */
  private sanitizePayload(data: any): any {
    const sanitize = (value: any): any => {
      if (value === null) return null;
      if (value === "") return undefined;
      if (value instanceof Date) return value;

      if (Array.isArray(value)) {
        return value
          .map(sanitize)
          .filter((item) => {
            if (item === undefined) return false;
            if (
              typeof item === "object" &&
              item !== null &&
              !Array.isArray(item) &&
              Object.keys(item).length === 0
            ) {
              return false;
            }
            return true;
          });
      }

      if (typeof value === "object" && value !== undefined) {
        const cleaned: Record<string, any> = {};
        for (const [key, val] of Object.entries(value)) {
          const result = sanitize(val);
          if (result !== undefined) {
            cleaned[key] = result;
          }
        }
        if (Object.keys(cleaned).length === 0) {
          return undefined;
        }
        return cleaned;
      }

      return value;
    };

    return sanitize(data);
  }

  /**
   * Remove undefined values before writing to Firestore.
   * Firestore rejects undefined but accepts null.
   * This is a safety net — serializeForFirestore is the shared utility.
   */
  private removeUndefined(data: any): any {
    return serializeForFirestore(data);
  }

  async create(
    data: any,
    tenantId: string,
    userId: string
  ): Promise<string> {
    // Sanitize payload: convert empty strings to undefined before validation
    const sanitized = this.sanitizePayload(data);

    logger.info("[StaffService] Payroll payload", {
      metadata: {
        payroll: sanitized.payroll,
        allowances: sanitized.payroll?.allowances,
        deductions: sanitized.payroll?.deductions,
      },
    });

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

    const firestoreData = this.removeUndefined(docData);

    logger.info("[StaffService] Firestore Payload", {
      metadata: { staffId: null, tenantId, userId, personal: firestoreData.personal },
    });

    const id = await this.repository.create(firestoreData as any, tenantId);

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

    await eventBus.publish(EVENTS.STAFF_CREATED, {
      staffId: id,
      tenantId,
      userId,
      fullName: validation.data?.personal?.fullName,
    });

    // Publish STAFF_ACTIVATED for lifecycle cascade
    await eventBus.publish(EVENTS.STAFF_ACTIVATED, {
      staffId: id,
      tenantId,
      userId,
      fullName: validation.data?.personal?.fullName,
      department: validation.data?.department,
      designation: validation.data?.designation,
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

    const firestoreData = this.removeUndefined(validation.data);

    await this.repository.update(id, firestoreData as any, tenantId);

    await this.audit.log({
      action: "staff.updated",
      userId: userId || "system",
      tenantId,
      entityId: id,
      entityType: "staff",
      metadata: { updatedFields: Object.keys(data) },
    });

    await eventBus.publish(EVENTS.STAFF_UPDATED, {
      staffId: id,
      tenantId,
      userId: userId || "system",
      updatedFields: Object.keys(data),
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

    await eventBus.publish(EVENTS.STAFF_DELETED, {
      staffId: id,
      tenantId,
      userId: userId || "system",
      fullName: staff.personal?.fullName,
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
