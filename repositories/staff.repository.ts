// repositories/staff.repository.ts
import { BaseRepository } from "./base.repository";
import { Staff } from "@/types/staff";
import { IStaffRepository } from "@/interfaces/IStaffRepository";
import { PaginatedResult } from "@/types/api";
import { RepositoryException } from "@/errors/AppError";

export class StaffRepository extends BaseRepository<Staff> implements IStaffRepository {
  constructor() {
    super("staff");
  }

  async search(tenantId: string, query: string): Promise<(Staff & { id: string })[]> {
    try {
      const all = await this.findAll(tenantId);
      const lowerQuery = query.toLowerCase();

      return all.filter(
        (staff) =>
          staff.personal?.fullName?.toLowerCase().includes(lowerQuery) ||
          staff.personal?.cnic?.includes(query) ||
          staff.contact?.mobile?.includes(query) ||
          staff.contact?.email?.toLowerCase().includes(lowerQuery) ||
          staff.professional?.personnelNo?.includes(query) ||
          staff.professional?.designation?.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      throw new RepositoryException("Failed to search staff", { query, tenantId });
    }
  }

  async countByDepartment(tenantId: string, department: string): Promise<number> {
    try {
      const all = await this.findAll(tenantId);
      return all.filter((s) => s.professional?.department === department).length;
    } catch (error) {
      throw new RepositoryException("Failed to count staff by department", {
        department,
        tenantId,
      });
    }
  }

  async findByEmail(tenantId: string, email: string): Promise<(Staff & { id: string }) | null> {
    try {
      const all = await this.findAll(tenantId);
      return all.find((s) => s.contact?.email?.toLowerCase() === email.toLowerCase()) ?? null;
    } catch (error) {
      throw new RepositoryException("Failed to find staff by email", { email, tenantId });
    }
  }
}

