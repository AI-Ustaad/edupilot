// services/leave.service.ts
import { LeaveRepository } from "@/repositories/leave.repository";
import { StaffRepository } from "@/repositories/staff.repository";
import { AuditService } from "./AuditService";
import type { ILeaveRepository } from "@/interfaces/ILeaveRepository";
import type { LeaveRequest } from "@/repositories/leave.repository";

export class LeaveService {
  private leaveRepo: ILeaveRepository;
  private staffRepo: StaffRepository;
  private audit: AuditService;

  constructor(leaveRepo?: ILeaveRepository, staffRepo?: StaffRepository, audit?: AuditService) {
    this.leaveRepo = leaveRepo ?? new LeaveRepository();
    this.staffRepo = staffRepo ?? new StaffRepository();
    this.audit = audit ?? new AuditService();
  }

  async findPendingByTenant(tenantId: string): Promise<(LeaveRequest & { id: string })[]> {
    const list = await this.leaveRepo.findPendingByTenant(tenantId);
    const cleanList: (LeaveRequest & { id: string })[] = [];
    for (const l of list) {
      const isTest = String(l.teacherName || "").toUpperCase().includes("TEST") || String(l.teacherName || "").toUpperCase().includes("ALPHA");
      if (isTest) {
        this.leaveRepo.delete(l.id, tenantId).catch(() => {});
      } else {
        cleanList.push(l);
      }
    }
    return cleanList;
  }

  async createLeaveRequest(data: Omit<LeaveRequest, "id" | "tenantId">, tenantId: string, userId?: string): Promise<string> {
    const id = await this.leaveRepo.create(data as any, tenantId);
    await this.audit.log({
      action: "leave.created",
      userId: userId || "system",
      tenantId,
      entityId: id,
      entityType: "leave",
      metadata: { teacherId: data.teacherId, status: data.status },
    });
    return id;
  }

  async updateStatus(id: string, data: Partial<LeaveRequest>, tenantId: string, userId?: string): Promise<void> {
    await this.leaveRepo.updateStatus(id, data, tenantId);
    await this.audit.log({
      action: data.status === "approved" ? "leave.approved" : (data.status === "rejected" ? "leave.rejected" : "leave.updated"),
      userId: userId || "system",
      tenantId,
      entityId: id,
      entityType: "leave",
      metadata: { status: data.status },
    });
  }

  async deleteLeave(id: string, tenantId: string, userId?: string): Promise<void> {
    await this.leaveRepo.delete(id, tenantId);
    await this.audit.log({
      action: "leave.deleted",
      userId: userId || "system",
      tenantId,
      entityId: id,
      entityType: "leave",
    });
  }

  async getStaffName(staffId: string, tenantId: string): Promise<string> {
    const teacher = await this.staffRepo.findById(staffId, tenantId);
    return teacher?.personal?.fullName || "Teacher";
  }
}
