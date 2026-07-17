import { BaseRepository } from "./base.repository";

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

export class LeaveRepository extends BaseRepository<LeaveRequest> {
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
    _tenantId?: string
  ): Promise<void> {
    await this.db.collection(this.collectionName).doc(id).update(data);
  }
}
