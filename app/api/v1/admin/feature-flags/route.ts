import { NextRequest } from "next/server";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse, createErrorResponse } from "@/lib/response/apiResponse";
import { withPermission } from '@/lib/auth/rbac';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { adminDb } from "@/lib/firebase-admin";
import type { TenantContext } from "@/types/api";

/**
 * GET: Fetch all feature flags for the current tenant
 * Requires: SETTINGS.VIEW permission
 */
export const GET = withErrorHandler(
  withAuth(
    withTenant(
<<<<<<< HEAD
      withPermission(PERMISSIONS.settings.view)(async (req: NextRequest, { tenantId }: TenantContext) => {
=======
     withPermission(PERMISSIONS.settings.view)(async (req: NextRequest, { tenantId }: TenantContext) => {
>>>>>>> origin/main
        try {
          const docRef = adminDb
            .collection("tenants")
            .doc(tenantId)
            .collection("settings")
            .doc("feature_flags");
            
          const docSnap = await docRef.get();
          const flags = docSnap.exists ? docSnap.data() : {};
          
          return createApiResponse(200, "Feature flags fetched successfully", flags);
        } catch (error) {
          console.error("Error fetching feature flags:", error);
          return createErrorResponse(500, "Failed to fetch feature flags");
        }
      })
    )
  )
);

/**
 * POST: Toggle/Update a specific feature flag
 * Requires: SETTINGS.MANAGE permission
 */
export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.update)(async (req: NextRequest, { tenantId, user }: TenantContext) => {
        try {
          const body = await req.json();
          const { feature, enabled } = body;

          if (!feature || typeof enabled !== 'boolean') {
            return createErrorResponse(400, "Invalid payload. 'feature' (string) and 'enabled' (boolean) are required.");
          }

          const docRef = adminDb
            .collection("tenants")
            .doc(tenantId)
            .collection("settings")
            .doc("feature_flags");

          await adminDb.runTransaction(async (transaction) => {
            const docSnap = await transaction.get(docRef);
            const currentFlags = docSnap.exists ? docSnap.data() || {} : {};
            
            currentFlags[feature] = enabled;
            currentFlags._metadata = {
              lastUpdatedBy: user.uid,
              lastUpdatedAt: new Date().toISOString()
            };

            transaction.set(docRef, currentFlags, { merge: true });
          });

          return createApiResponse(200, `Feature '${feature}' updated successfully`, { feature, enabled });
        } catch (error) {
          console.error("Error updating feature flag:", error);
          return createErrorResponse(500, "Failed to update feature flag");
        }
      })
    )
  )
);
