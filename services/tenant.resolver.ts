import { TenantRepository } from "@/repositories/tenant.repository";
import { logger } from "@/lib/logger/logger";
import { TenantResolutionError } from "@/lib/errors/configuration.errors";
import { ITenantResolver, ResolvedTenant, TenantResolverContext } from "@/interfaces/ITenantResolver";
import type { RequestContext } from "@/route-helpers/request-context";

export class TenantResolver implements ITenantResolver {
  private readonly USERS_COLLECTION = "users";
  private tenantRepo = new TenantRepository();

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

    // SECURITY FIX (Phase 1): never invent a tenant ID. A user with no
    // assigned tenant is rejected (fail closed) instead of being silently
    // scoped to a fabricated `tenant_<hash>` namespace, which would break
    // the foundational tenant-isolation guarantee. Callers (withTenant)
    // translate this error into a 403 response.
    throw new TenantResolutionError("User is not assigned to a tenant");
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

  async verifyTenantExists(tenantId: string): Promise<boolean> {
    return this.tenantRepo.verifyTenantExists(tenantId);
  }
}

export const tenantResolver = new TenantResolver();
