// services/leave.service.ts
import { LeaveRepository } from "@/repositories/leave.repository";
import { StaffRepository } from "@/repositories/staff.repository";
import type { ILeaveRepository } from "@/interfaces/ILeaveRepository";
import type { LeaveRequest } from "@/repositories/leave.repository";

export class LeaveService {
  private leaveRepo: ILeaveRepository;
  private staffRepo: StaffRepository;

  constructor(leaveRepo?: ILeaveRepository, staffRepo?: StaffRepository) {
    this.leaveRepo = leaveRepo ?? new LeaveRepository();
    this.staffRepo = staffRepo ?? new StaffRepository();
  }

  async findPendingByTenant(tenantId: string): Promise<(LeaveRequest & { id: string })[]> {
    return this.leaveRepo.findPendingByTenant(tenantId);
  }

  async createLeaveRequest(data: Omit<LeaveRequest, "id" | "tenantId">, tenantId: string): Promise<string> {
    return this.leaveRepo.create(data as any, tenantId);
  }

  async updateStatus(id: string, data: Partial<LeaveRequest>, tenantId: string): Promise<void> {
    return this.leaveRepo.updateStatus(id, data, tenantId);
  }

  async getStaffName(staffId: string, tenantId: string): Promise<string> {
    const teacher = await this.staffRepo.findById(staffId, tenantId);
    return teacher?.personal?.fullName || "Teacher";
  }
}
