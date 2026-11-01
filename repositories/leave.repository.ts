import { BaseRepository } from "./base.repository";
import type { ILeaveRepository } from "@/interfaces/ILeaveRepository";
import { NotFoundException } from "@/errors/AppError";

export interface LeaveRequest {
  tenantId: string;
  teacherId: string;
  status: string;
  startDate?: string;
  endDate?: string;
  reason?: string;
  substituteTeacherId?: string;
  arrangements?: any;
  approvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

export class LeaveRepository extends BaseRepository<LeaveRequest> implements ILeaveRepository {
  constructor() {
    super("leave_requests");
  }

  async findPendingByTenant(tenantId: string): Promise<(LeaveRequest & { id: string })[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .where("status", "==", "pending")
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaveRequest & { id: string }));
  }

  async updateStatus(
    id: string,
    data: Partial<LeaveRequest>,
    tenantId: string
  ): Promise<void> {
    const docRef = this.db.collection(this.collectionName).doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists || docSnap.data()?.tenantId !== tenantId) {
      throw new NotFoundException("Leave request not found or access denied for this tenant");
    }
    await docRef.update(data);
  }
}
