import { RequestContext } from "@/route-helpers/request-context";

export interface ResolvedTenant {
  tenantId: string;
  source: "user_document" | "derived_from_uid" | "header";
  confidence: "high" | "medium" | "low";
}

export interface TenantResolverContext {
  user?: {
    uid: string;
    email: string;
    role: string;
    tenantId?: string | null;
  };
  sessionCookie?: string;
  headers?: Record<string, string>;
}

export interface ITenantResolver {
  resolve(context: TenantResolverContext): Promise<ResolvedTenant>;
  resolveFromContext(requestContext: RequestContext, user?: TenantResolverContext["user"]): Promise<ResolvedTenant>;
}
