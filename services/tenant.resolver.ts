import { adminDb } from "@/lib/firebase-admin";
import { logger } from "@/lib/logger/logger";
import { TenantResolutionError } from "@/lib/errors/configuration.errors";
import { ITenantResolver, ResolvedTenant, TenantResolverContext } from "@/interfaces/ITenantResolver";
import type { RequestContext } from "@/route-helpers/request-context";

export class TenantResolver implements ITenantResolver {
  private readonly USERS_COLLECTION = "users";

  async resolve(context: TenantResolverContext): Promise<ResolvedTenant> {
    const { user } = context;

    if (!user) {
      throw new TenantResolutionError("No user context available for tenant resolution");
    }

    if (user.tenantId && user.tenantId.trim() !== "") {
      return {
        tenantId: user.tenantId,
        source: "user_document",
        confidence: "high",
      };
    }

    const derivedTenantId = this.deriveTenantId(user.uid, user.email);
    return {
      tenantId: derivedTenantId,
      source: "derived_from_uid",
      confidence: "medium",
    };
  }

  async resolveFromContext(
    requestContext: RequestContext,
    user?: TenantResolverContext["user"]
  ): Promise<ResolvedTenant> {
    const headers: Record<string, string> = {
      requestId: requestContext.requestId,
    };

    if (requestContext.traceId) {
      headers.traceId = requestContext.traceId;
    }

    const context: TenantResolverContext = {
      user,
      headers,
    };

    try {
      const result = await this.resolve(context);
      logger.info("TENANT_RESOLVED", {
        tenantId: result.tenantId,
        source: result.source,
        confidence: result.confidence,
        requestId: requestContext.requestId,
      });
      return result;
    } catch (error) {
      logger.error("TENANT_RESOLUTION_FAILED", {
        metadata: {
          error,
          requestId: requestContext.requestId,
          uid: user?.uid,
        },
      });
      throw error;
    }
  }

  private deriveTenantId(uid: string, email?: string): string {
    if (uid.startsWith("tenant_")) {
      return uid;
    }

    if (email) {
      const emailHash = this.simpleHash(email);
      return `tenant_${emailHash}`;
    }

    return `tenant_${uid}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  async verifyTenantExists(tenantId: string): Promise<boolean> {
    try {
      const doc = await adminDb.collection("tenants").doc(tenantId).get();
      return doc.exists;
    } catch (error) {
      logger.error("TENANT_VERIFICATION_FAILED", {
        metadata: { tenantId, error },
      });
      return false;
    }
  }
}

export const tenantResolver = new TenantResolver();
