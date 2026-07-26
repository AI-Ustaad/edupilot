import { adminDb } from "@/lib/firebase-admin";
import { SessionUser, Role } from "@/types/auth";
import { UserProfileNotFoundError } from "@/lib/auth/auth.errors";
import { logger } from "@/lib/logger/logger";
import { RequestContext } from "@/route-helpers/request-context";

export interface IUserRepository {
  findByUidWithFallback(uid: string, email?: string, context?: RequestContext): Promise<SessionUser>;
  findAllByTenant(tenantId: string): Promise<SessionUser[]>;
  updateRole(uid: string, role: Role, tenantId: string): Promise<void>;
  create(data: { uid: string; email: string; role: Role; tenantId: string | null; onboardingRequired?: boolean; createdAt: Date }): Promise<string>;
}

export class UserRepository implements IUserRepository {
  constructor(private db = adminDb) {}

  async findByUidWithFallback(uid: string, email?: string, context?: RequestContext): Promise<SessionUser> {
    let userDoc = await this.db.collection("users").doc(uid).get();
    
    if (!userDoc.exists && email) {
      const snapshot = await this.db.collection("users").where("email", "==", email).get();
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
      uid, 
      email: email || data.email || "",
      role: (data.role as Role) || "guest",
      tenantId: data.tenantId || null,
      onboardingRequired: data.onboardingRequired ?? false,
    };
  }

  async findAllByTenant(tenantId: string): Promise<SessionUser[]> {
    try {
      const snapshot = await this.db
        .collection("users")
        .where("tenantId", "==", tenantId)
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
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
      const doc = await this.db.collection("users").doc(uid).get();
      if (!doc.exists || doc.data()?.tenantId !== tenantId) {
        throw new Error("User not found or unauthorized");
      }
      await this.db.collection("users").doc(uid).update({
        role,
        updatedAt: new Date(),
      });
    } catch (error) {
      throw new Error(`Failed to update user role: ${error}`);
    }
  }

  async create(data: { uid: string; email: string; role: Role; tenantId: string | null; onboardingRequired?: boolean; createdAt: Date }): Promise<string> {
    try {
      await this.db.collection("users").doc(data.uid).set({
        ...data,
        createdAt: data.createdAt || new Date(),
      });
      return data.uid;
    } catch (error) {
      throw new Error(`Failed to create user: ${error}`);
    }
  }
}
