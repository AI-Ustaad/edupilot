// repositories/staff.repository.ts
import { BaseRepository } from "./base.repository";
import { Staff } from "@/types/staff";
import { IStaffRepository } from "@/interfaces/IStaffRepository";
import { PaginatedResult } from "@/types/api";
import { RepositoryException } from "@/errors/AppError";
import { adminDb } from "@/lib/firebase-admin";

export class StaffRepository extends BaseRepository<Staff> implements IStaffRepository {
  constructor() {
    super("staff");
  }

  async search(tenantId: string, query: string): Promise<(Staff & { id: string })[]> {
    try {
      // Scope query by tenantId first, then filter client-side (Firestore doesn't support OR on nested fields)
      const snapshot = await adminDb
        .collection("staff")
        .where("tenantId", "==", tenantId)
        .get();

      const lowerQuery = query.toLowerCase();
      return snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Staff & { id: string }))
        .filter(
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

  async findByEmail(tenantId: string, email: string): Promise<(Staff & { id: string }) | null> {
    try {
      const snapshot = await adminDb
        .collection("staff")
        .where("tenantId", "==", tenantId)
        .where("contact.email", "==", email.toLowerCase())
        .limit(1)
        .get();

      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Staff & { id: string };
    } catch (error) {
      throw new RepositoryException("Failed to find staff by email", { email, tenantId });
    }
  }
}

