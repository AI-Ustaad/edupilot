import { NextResponse } from 'next/server';
import { tenantResolver } from "@/services/tenant.resolver";
import { logger } from "@/lib/logger/logger";
import type { ResolvedTenant } from "@/types/tenant/tenant-resolver";

interface TenantContext {
  tenantId: string;
  user?: {
    uid: string;
    email: string;
    role: string;
    tenantId?: string | null;
  };
  resolvedTenant?: ResolvedTenant;
}

export const withTenant = (handler: Function) => {
  return async (req: Request, context: any = {}) => {
    const user = context?.user;

    try {
      if (!user) {
        return NextResponse.json({ success: false, error: 'User context is required' }, { status: 403 });
      }

      const resolvedTenant = await tenantResolver.resolve({
        user: {
          uid: user.uid,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
        },
      });

      context.tenantId = resolvedTenant.tenantId;
      context.resolvedTenant = resolvedTenant;

      return handler(req, context);
    } catch (error) {
      logger.error("TENANT_RESOLUTION_FAILED_IN_MIDDLEWARE", {
        metadata: { error, userId: user?.uid },
      });

      return NextResponse.json(
        { success: false, error: 'Tenant ID is required or User is not assigned to a tenant' },
        { status: 403 }
      );
    }
  };
};

export function isTenantContext(obj: any): obj is TenantContext {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.tenantId === "string" &&
    obj.tenantId.length > 0
  );
}
