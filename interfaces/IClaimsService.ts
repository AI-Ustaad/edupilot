// interfaces/IClaimsService.ts
import type { SessionUser } from "@/types/auth";
import type { RequestContext } from "@/route-helpers/request-context";

export interface IClaimsService {
  sync(user: SessionUser, context: RequestContext): Promise<void>;
}
