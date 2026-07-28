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

export interface ResolvedTenant {
  tenantId: string;
  source: "user_document" | "derived_from_uid" | "header";
  confidence: "high" | "medium" | "low";
}
