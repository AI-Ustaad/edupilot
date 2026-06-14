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
      withPermission(PERMISSIONS.SETTINGS.VIEW)(async (req: NextRequest, { tenantId }: TenantContext) => {
        try {
          // Fetch feature flags from Firestore (Tenant Isolated)
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
      withPermission(PERMISSIONS.SETTINGS.MANAGE)(async (req: NextRequest, { tenantId, user }: TenantContext) => {
        try {
          const body = await req.json();
          const { feature, enabled } = body;

          // Validation
          if (!feature || typeof enabled !== 'boolean') {
            return createErrorResponse(400, "Invalid payload. 'feature' (string) and 'enabled' (boolean) are required.");
          }

          const docRef = adminDb
            .collection("tenants")
            .doc(tenantId)
            .collection("settings")
            .doc("feature_flags");

          // Use Transaction for safe updates
          await adminDb.runTransaction(async (transaction) => {
            const docSnap = await transaction.get(docRef);
            const currentFlags = docSnap.exists ? docSnap.data() || {} : {};
            
            // Update the specific flag
            currentFlags[feature] = enabled;
            
            // Optional: Add audit metadata
            currentFlags._metadata = {
              lastUpdatedBy: user.uid,
              lastUpdatedAt: new Date().toISOString()
            };

            transaction.set(docRef, currentFlags, { merge: true });
          });

          // Log Audit (Optional but recommended for settings changes)
          // await logAudit({ action: 'SETTINGS_UPDATE', entityType: 'FeatureFlag', entityId: feature, userId: user.uid, tenantId, metadata: { enabled } });

          return createApiResponse(200, `Feature '${feature}' updated successfully`, { feature, enabled });
        } catch (error) {
          console.error("Error updating feature flag:", error);
          return createErrorResponse(500, "Failed to update feature flag");
        }
      })
    )
  )
);
