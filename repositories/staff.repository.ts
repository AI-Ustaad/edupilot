// repositories/staff.repository.ts
import { BaseRepository } from "./base.repository";
import { Staff } from "@/types/staff";

export class StaffRepository extends BaseRepository<Staff> {
  constructor() {
    super("staff");
  }

  // اگر مخصوص میتھڈز کی ضرورت ہو تو یہاں لکھیں، مثلاً:
  // async findByDepartment(department: string, tenantId: string): Promise<Staff[]> { ... }
}
