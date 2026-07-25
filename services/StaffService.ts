// services/StaffService.ts
import { IStaffRepository } from "@/interfaces/IStaffRepository";
import type { IStaffService } from "@/interfaces/IStaffService";
import { StaffRepository } from "@/repositories/staff.repository";
import { AttendanceRepository } from "@/repositories/attendance.repository";
import type { StaffEntity, StaffTimelineEntry } from "@/entities/staff.entity";
import type { CreateStaffDTO, UpdateStaffDTO } from "@/dto";
import type { StaffFilter, StaffAnalytics } from "@/types/staff";
import type { PaginatedResult } from "@/types/api";
import { ValidationService } from "./ValidationService";
import { AuditService } from "./AuditService";
import { CreateStaffSchema, UpdateStaffSchema } from "@/validators/staff";
import {
  NotFoundException,
  BusinessError,
  ValidationError,
  SubscriptionLimitException,
} from "@/errors/AppError";
import { logger } from "@/lib/logger/logger";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";
import { GeminiProvider } from "@/lib/ai/providers/GeminiProvider";
import { StaffPersistenceMapper } from "@/lib/mappers/StaffPersistenceMapper";

export class StaffService implements IStaffService {
  private repository: IStaffRepository;
  private validation: ValidationService;
  private audit: AuditService;
  private attendanceRepo: AttendanceRepository;
  private aiProvider: GeminiProvider;

  constructor(repository?: IStaffRepository) {
    this.repository = repository ?? new StaffRepository();
    this.validation = new ValidationService();
    this.audit = new AuditService();
    this.attendanceRepo = new AttendanceRepository();
    this.aiProvider = new GeminiProvider();
  }

  async list(tenantId: string): Promise<StaffEntity[]> {
    const docs = await this.repository.findAll(tenantId);
    return docs.map(doc => StaffPersistenceMapper.fromFirestore(doc));
  }

  async paginate(
    tenantId: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResult<StaffEntity>> {
    const result = await this.repository.paginate(tenantId, page, limit);
    return {
      ...result,
      data: result.data.map(doc => StaffPersistenceMapper.fromFirestore(doc))
    };
  }

  async getById(tenantId: string, id: string): Promise<StaffEntity> {
    const doc = await this.repository.findById(id, tenantId);
    if (!doc) throw new NotFoundException("Staff member not found");
    return StaffPersistenceMapper.fromFirestore(doc);
  }

  async create(data: CreateStaffDTO, tenantId: string, userId: string): Promise<string> {
    const validation = this.validation.validate(CreateStaffSchema, data);
    if (!validation.success) {
      logger.warn("[StaffService] Validation failed", {
        metadata: { errors: validation.errors, payload: data },
      });
      throw new ValidationError("Validation failed", validation.errors);
    }

    if (validation.data?.contact?.email) {
      const existing = await this.repository.findByEmail(tenantId, validation.data.contact.email);
      if (existing) {
        throw new BusinessError("A staff member with this email already exists");
      }
    }

    const entity = StaffPersistenceMapper.fromDTO(validation.data);
    const document = StaffPersistenceMapper.toFirestore(entity, userId);

    const savedDoc = await this.repository.save({
      ...document,
      tenantId,
    }, tenantId);
    const id = savedDoc.id || "";

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

    await eventBus.publish(EVENTS.STAFF_ACTIVATED, {
      staffId: id,
      tenantId,
      userId,
      fullName: validation.data?.personal?.fullName,
      department: validation.data?.professional?.department,
      designation: validation.data?.professional?.designation,
    });

    return id;
  }

  async update(tenantId: string, id: string, data: UpdateStaffDTO, userId?: string): Promise<void> {
    await this.getById(tenantId, id);

    const validation = this.validation.validate(UpdateStaffSchema, data);
    if (!validation.success) {
      logger.warn("[StaffService] Update validation failed", {
        metadata: { errors: validation.errors, staffId: id, tenantId },
      });
      throw new ValidationError("Validation failed", validation.errors);
    }

    const entity = StaffPersistenceMapper.fromDTO(validation.data);
    const document = StaffPersistenceMapper.toFirestore(entity, userId || "");

    const updatePayload: Record<string, unknown> = { ...document, updatedBy: userId || "system", updatedAt: new Date() };
    Object.keys(updatePayload).forEach(key => {
      if (updatePayload[key as keyof typeof updatePayload] === undefined) {
        delete updatePayload[key as keyof typeof updatePayload];
      }
    });

    await this.repository.update(id, updatePayload, tenantId);

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

  async search(tenantId: string, query: string): Promise<StaffEntity[]> {
    const docs = await this.repository.search(tenantId, query);
    return docs.map(doc => StaffPersistenceMapper.fromFirestore(doc));
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

  async hire(
    data: CreateStaffDTO,
    tenantId: string,
    userId: string
  ): Promise<string> {
    const hireData: CreateStaffDTO = {
      ...data,
      status: "active",
      metadata: {
        version: data.metadata?.version ?? 1,
        source: data.metadata?.source || "hire",
      },
    };

    const id = await this.create(hireData, tenantId, userId);

    await this.audit.log({
      action: "staff.hired",
      userId,
      tenantId,
      entityId: id,
      entityType: "staff",
      metadata: { hiredBy: userId },
    });

    await eventBus.publish(EVENTS.STAFF_ACTIVATED, {
      staffId: id,
      tenantId,
      userId,
    });

    return id;
  }

  async promote(
    tenantId: string,
    staffId: string,
    newDesignation: string,
    newDepartment: string | undefined,
    userId: string
  ): Promise<void> {
    const staff = await this.getById(tenantId, staffId);
    const oldDesignation = staff.professional?.designation;
    const oldDepartment = staff.professional?.department;

    const updateData: UpdateStaffDTO = {
      professional: {
        personnelNo: staff.professional?.personnelNo || "",
        designation: newDesignation,
        department: newDepartment || staff.professional?.department,
        role: staff.professional?.role,
        employmentType: staff.professional?.employmentType,
        joiningDate: staff.professional?.joiningDate,
        confirmationDate: staff.professional?.confirmationDate,
        experience: staff.professional?.experience,
        qualification: staff.professional?.qualification,
      },
      performance: {
        score: staff.performance?.score,
        principalRemarks: staff.performance?.principalRemarks,
        warnings: staff.performance?.warnings,
        achievements: staff.performance?.achievements,
        promotions: [...(staff.performance?.promotions || []), `Promoted to ${newDesignation}`],
        trainingHistory: staff.performance?.trainingHistory,
      },
    };

    await this.update(tenantId, staffId, updateData, userId);

    await this.audit.log({
      action: "staff.promoted",
      userId,
      tenantId,
      entityId: staffId,
      entityType: "staff",
      metadata: { oldDesignation, newDesignation, oldDepartment, newDepartment },
    });

    await eventBus.publish(EVENTS.STAFF_PROMOTED, {
      staffId,
      tenantId,
      userId,
      oldDesignation,
      newDesignation,
    });
  }

  async transfer(
    tenantId: string,
    staffId: string,
    reason: string,
    userId: string
  ): Promise<void> {
    const staff = await this.getById(tenantId, staffId);
    const now = new Date().toISOString();

    const statusRecord = {
      fromStatus: staff.status || "active",
      toStatus: "on-leave" as const,
      changedAt: now,
      changedBy: userId,
      reason,
    };

    const updateData: UpdateStaffDTO = {
      status: "on-leave",
      statusHistory: [...(staff.statusHistory || []), statusRecord],
    };

    await this.update(tenantId, staffId, updateData, userId);

    await this.audit.log({
      action: "staff.transferred",
      userId,
      tenantId,
      entityId: staffId,
      entityType: "staff",
      metadata: { reason },
    });
  }

  async terminate(
    tenantId: string,
    staffId: string,
    reason: string,
    userId: string
  ): Promise<void> {
    const staff = await this.getById(tenantId, staffId);
    const now = new Date().toISOString();

    const statusRecord = {
      fromStatus: staff.status || "active",
      toStatus: "terminated" as const,
      changedAt: now,
      changedBy: userId,
      reason,
    };

    const updateData: UpdateStaffDTO = {
      status: "terminated",
      statusHistory: [...(staff.statusHistory || []), statusRecord],
    };

    await this.update(tenantId, staffId, updateData, userId);

    await this.audit.log({
      action: "staff.terminated",
      userId,
      tenantId,
      entityId: staffId,
      entityType: "staff",
      metadata: { reason },
    });

    await eventBus.publish(EVENTS.STAFF_DEACTIVATED, {
      staffId,
      tenantId,
      userId,
      fullName: staff.personal?.fullName,
      reason,
    });
  }

  async archive(tenantId: string, staffId: string, userId: string): Promise<void> {
    await this.repository.archive(tenantId, staffId);

    await this.audit.log({
      action: "staff.archived",
      userId,
      tenantId,
      entityId: staffId,
      entityType: "staff",
    });

    await eventBus.publish(EVENTS.STAFF_DEACTIVATED, {
      staffId,
      tenantId,
      userId,
    });
  }

  async restore(tenantId: string, staffId: string, userId: string): Promise<void> {
    await this.repository.restore(tenantId, staffId);

    await this.audit.log({
      action: "staff.restored",
      userId,
      tenantId,
      entityId: staffId,
      entityType: "staff",
    });

    await eventBus.publish(EVENTS.STAFF_ACTIVATED, {
      staffId,
      tenantId,
      userId,
    });
  }

  async bulkUpdate(tenantId: string, ids: string[], data: UpdateStaffDTO, userId: string): Promise<void> {
    await this.repository.bulkUpdate(tenantId, ids, data);

    await this.audit.log({
      action: "staff.bulk_updated",
      userId,
      tenantId,
      entityType: "staff",
      metadata: { count: ids.length, fields: Object.keys(data) },
    });
  }

  async bulkDelete(tenantId: string, ids: string[], userId: string): Promise<void> {
    await this.repository.bulkDelete(tenantId, ids);

    await this.audit.log({
      action: "staff.bulk_deleted",
      userId,
      tenantId,
      entityType: "staff",
      metadata: { count: ids.length },
    });
  }

  async getAnalytics(tenantId: string): Promise<StaffAnalytics> {
    return this.repository.staffAnalytics(tenantId);
  }

  async getTimeline(tenantId: string, staffId: string): Promise<StaffTimelineEntry[]> {
    return this.repository.timeline(tenantId, staffId);
  }

  async getAttendance(tenantId: string, staffId: string): Promise<any> {
    const staff = await this.getById(tenantId, staffId);
    return staff.attendance || { presentDays: 0, absentDays: 0, lateArrivals: 0, leaves: 0, attendancePercent: 0 };
  }

  async getLeave(tenantId: string, staffId: string): Promise<any> {
    const staff = await this.getById(tenantId, staffId);
    return {
      balance: staff.leaves || {},
    };
  }

  async getPayroll(tenantId: string, staffId: string): Promise<any> {
    const staff = await this.getById(tenantId, staffId);
    const payroll = staff.payroll || {};
    const allowances = payroll.allowances || [];
    const deductions = payroll.deductions || [];
    const totalAllowances = allowances.reduce((sum, a) => sum + (a.amount || 0), 0);
    const totalDeductions = deductions.reduce((sum, d) => sum + (d.amount || 0), 0);

    return {
      ...payroll,
      totalAllowances,
      totalDeductions,
      computedGross: (payroll.basicSalary || 0) + totalAllowances,
      computedNet: ((payroll.basicSalary || 0) + totalAllowances) - totalDeductions,
    };
  }

  async getAISummary(tenantId: string, staffId: string): Promise<any> {
    const staff = await this.getById(tenantId, staffId);

    const summaryData = {
      name: staff.personal?.fullName,
      designation: staff.professional?.designation,
      department: staff.professional?.department,
      status: staff.status || "active",
      attendance: staff.attendance,
      leaves: staff.leaves,
      performance: staff.performance,
      academic: staff.academic,
    };

    const prompt = `Analyze this staff member's profile and provide a brief summary with risk alerts and suggestions:
${JSON.stringify(summaryData, null, 2)}

Provide:
1. Overall assessment (1-2 sentences)
2. Key strengths
3. Areas of concern
4. Recommendations

Keep response concise and structured.`;

    try {
      const response = await this.aiProvider.generateContent(
        prompt,
        "You are an HR analytics assistant. Provide concise, professional analysis of staff data."
      );

      return {
        summary: response.text,
        staffId,
        generatedAt: new Date().toISOString(),
        model: this.aiProvider.getConfig().model,
      };
    } catch (error) {
      logger.warn("[StaffService] AI summary failed", { metadata: { staffId, error } });
      return {
        summary: "AI summary unavailable. Staff data is valid.",
        staffId,
        generatedAt: new Date().toISOString(),
        error: true,
      };
    }
  }

  async advancedFilter(
    tenantId: string,
    filter: StaffFilter
  ): Promise<{ data: StaffEntity[]; total: number; page: number; totalPages: number }> {
    const docs = await this.repository.advancedFilter(tenantId, filter);
    return {
      ...docs,
      data: docs.data.map(doc => StaffPersistenceMapper.fromFirestore(doc))
    };
  }

  async bulkCreate(tenantId: string, staff: CreateStaffDTO[], userId: string) {
    const results: any[] = [];
    for (const studentData of staff) {
      try {
        const created = await this.create(studentData, tenantId, userId);
        results.push({ success: true, id: created });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        results.push({ success: false, error: message });
      }
    }
    return { 
      success: true, 
      created: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results 
    };
  }
}
