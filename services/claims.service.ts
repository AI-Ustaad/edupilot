import { adminAuth } from "@/lib/firebase-admin";
import { SessionUser } from "@/types/auth";
import { logger } from "@/lib/logger/logger";
import { RequestContext } from "@/route-helpers/request-context";

export class ClaimsService {
  constructor(private auth = adminAuth) {}

  async sync(user: SessionUser, context: RequestContext): Promise<void> {
    const currentRecord = await this.auth.getUser(user.uid);
    const claims = currentRecord.customClaims || {};

    if (claims.role !== user.role || claims.tenantId !== user.tenantId) {
      await this.auth.setCustomUserClaims(user.uid, { role: user.role, tenantId: user.tenantId });
      logger.info("CLAIMS_SYNCHRONIZED", { uid: user.uid, role: user.role, requestId: context.requestId });
    }
  }
}
