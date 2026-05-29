import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { adminDb } from "@/lib/firebase-admin";
import { logAction } from "@/lib/audit";

interface WithTenantContext {
tenantId: string;
user: {
uid: string;
email: string;
role: string;
tenantId: string;
};
}

function getIdFromUrl(req: Request): string {
const url = new URL(req.url);
const segments = url.pathname.split("/");
return segments[segments.length - 1];
}

export const GET = withErrorHandler(
withAuth(
withTenant(async (req: Request, { tenantId }: WithTenantContext) => {
const id = getIdFromUrl(req);

```
  const doc = await adminDb.collection("students").doc(id).get();

  if (!doc.exists || doc.data()?.tenantId !== tenantId) {
    return createApiResponse(404, null, "Student not found");
  }

  return createApiResponse(200, {
    id: doc.id,
    ...doc.data(),
  });
})
```

)
);

export const PUT = withErrorHandler(
withAuth(
withTenant(async (req: Request, { tenantId, user }: WithTenantContext) => {
if (user.role !== "admin") {
return createApiResponse(403, null, "Forbidden");
}

```
  const id = getIdFromUrl(req);
  const body = await req.json();

  const docRef = adminDb.collection("students").doc(id);
  const doc = await docRef.get();

  if (!doc.exists || doc.data()?.tenantId !== tenantId) {
    return createApiResponse(404, null, "Student not found");
  }

  await docRef.update({
    ...body,
    updatedAt: new Date(),
  });

  return createApiResponse(200, null, "Student updated successfully");
})
```

)
);

export const DELETE = withErrorHandler(
withAuth(
withTenant(async (req: Request, { tenantId, user }: WithTenantContext) => {
if (user.role !== "admin") {
return createApiResponse(403, null, "Forbidden");
}

```
  const id = getIdFromUrl(req);

  const docRef = adminDb.collection("students").doc(id);
  const doc = await docRef.get();

  if (!doc.exists || doc.data()?.tenantId !== tenantId) {
    return createApiResponse(404, null, "Student not found");
  }

  const student = doc.data();

  await docRef.delete();

  await logAction({
    action: "STUDENT_DELETED",
    userId: user.uid,
    tenantId,
    entityId: id,
    entityType: "student",
    metadata: {
      name: student?.fullName,
    },
  });

  return createApiResponse(
    200,
    null,
    "Student deleted successfully"
  );
})
```

)
);
