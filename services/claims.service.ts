import { AuthRepository } from "@/repositories/auth.repository";
import { SessionUser } from "@/types/auth";
import { logger } from "@/lib/logger/logger";
import { RequestContext } from "@/route-helpers/request-context";
import type { IClaimsService } from "@/interfaces/IClaimsService";

export class ClaimsService implements IClaimsService {
  constructor(private authRepo = new AuthRepository()) {}

  async sync(user: SessionUser, context: RequestContext): Promise<void> {
    const currentRecord = await this.authRepo.getUser(user.uid);
    const claims = currentRecord.customClaims || {};

    if (claims.role !== user.role || claims.tenantId !== user.tenantId) {
      await this.authRepo.setCustomUserClaims(user.uid, { role: user.role, tenantId: user.tenantId });
      logger.info("CLAIMS_SYNCHRONIZED", { uid: user.uid, role: user.role, requestId: context.requestId });
    }
  }
}
