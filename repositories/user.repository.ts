import { adminDb } from "@/lib/firebase-admin";
import { SessionUser, Role } from "@/types/auth";
import { UserProfileNotFoundError } from "@/lib/auth/auth.errors";
import { logger } from "@/lib/logger/logger";
import { RequestContext } from "@/route-helpers/request-context";

export class UserRepository {
  // Dependency Injection for testing
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
}
