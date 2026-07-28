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

  async updateStatus(id: string, data: Partial<LeaveRequest>): Promise<void> {
    return this.leaveRepo.updateStatus(id, data);
  }

  async getStaffName(staffId: string, tenantId: string): Promise<string> {
    const teacher = await this.staffRepo.findById(staffId, tenantId);
    return teacher?.personal?.fullName || "Teacher";
  }
}
