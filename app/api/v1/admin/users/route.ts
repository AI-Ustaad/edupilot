// app/api/admin/users/route.ts
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";

interface WithTenantContext {
  tenantId: string;
  user: {
    uid: string;
    email: string;
    role: string;
    tenantId: string;
  };
}

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: WithTenantContext) => {
      if (user.role !== "admin") {
        return createApiResponse(403, null, "Forbidden");
      }

      try {
        const usersSnapshot = await adminDb
          .collection("users")
          .where("tenantId", "==", tenantId)
          .get();

        const users = usersSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            uid: doc.id,
            email: data.email,
            role: data.role || "teacher",
            name: data.name || data.email?.split("@")[0],
          };
        });

        return createApiResponse(200, users);
      } catch (err) {
        console.error("Error fetching users:", err);
        return createApiResponse(500, null, "Failed to fetch users");
      }
    })
  )
);
