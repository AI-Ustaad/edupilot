import { BaseRepository } from "./base.repository";
import { SessionUser, Role } from "@/types/auth";
import { UserProfileNotFoundError } from "@/lib/auth/auth.errors";
import { logger } from "@/lib/logger/logger";
import { RequestContext } from "@/route-helpers/request-context";
import type { IUserRepository } from "@/interfaces/IUserRepository";

export class UserRepository extends BaseRepository<any> implements IUserRepository {
  constructor() {
    super("users");
  }

  async findByUidWithFallback(uid: string, email?: string, context?: RequestContext): Promise<SessionUser> {
    let userDoc = await this.db.collection(this.collectionName).doc(uid).get();
    
    if (!userDoc.exists && email) {
      const snapshot = await this.db.collection(this.collectionName).where("email", "==", email).get();
      if (!snapshot.empty) {
        userDoc = snapshot.docs[0];
        logger.warn("AUTH_UID_MISMATCH", {
          firebaseUid: uid, firestoreUid: userDoc.id, email, requestId: context?.requestId
        });
      }
    }

    if (!userDoc.exists) {
      throw new UserProfileNotFoundError(uid);
    }

    const data = userDoc.data()!;
    return {
      uid: userDoc.id,
      email: email || data.email || "",
      role: (data.role as Role) || "guest",
      tenantId: data.tenantId || null,
      onboardingRequired: data.onboardingRequired ?? false,
    };
  }

  async findAllByTenant(tenantId: string): Promise<SessionUser[]> {
    try {
      const snapshot = await this.findAll(tenantId);

      return snapshot.map(doc => {
        const data = doc;
        return {
          uid: doc.id,
          email: data.email || "",
          role: (data.role as Role) || "teacher",
          tenantId: data.tenantId || null,
          onboardingRequired: data.onboardingRequired ?? false,
        };
      });
    } catch (error) {
      throw new Error(`Failed to fetch users for tenant: ${error}`);
    }
  }

  async updateRole(uid: string, role: Role, tenantId: string): Promise<void> {
    try {
      await this.update(uid, { role, updatedAt: new Date() }, tenantId);
    } catch (error) {
      throw new Error(`Failed to update user role: ${error}`);
    }
  }

  async create(data: { uid: string; email: string; role: Role; tenantId: string | null; onboardingRequired?: boolean; createdAt: Date }): Promise<string> {
    try {
      const id = await this.db.collection(this.collectionName).doc(data.uid).set({
        ...data,
        createdAt: data.createdAt || new Date(),
      });
      return data.uid;
    } catch (error) {
      throw new Error(`Failed to create user: ${error}`);
    }
  }
}
