import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";

export const POST = withErrorHandler(async (req: Request) => {
  const { schoolName, phone } = await req.json();
  const session = cookies().get("session")?.value;
  if (!session) return createApiResponse(401, null, "No session");

  const decoded = await adminAuth.verifySessionCookie(session);
  const tenantId = `school_${Math.random().toString(36).substr(2, 9)}`;

  await adminDb.collection("tenants").doc(tenantId).set({
    name: schoolName,
    ownerId: decoded.uid,
    createdAt: new Date(),
  });

  await adminAuth.setCustomUserClaims(decoded.uid, {
    role: "admin",
    tenantId,
  });

  await adminDb.collection("users").doc(decoded.uid).set({
    uid: decoded.uid,
    email: decoded.email,
    role: "admin",
    tenantId,
    schoolName,
    createdAt: new Date(),
  });

  return createApiResponse(200, null, "School registered");
});
