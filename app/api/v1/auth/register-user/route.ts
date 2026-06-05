export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { withErrorHandler, withRateLimit } from "@/route-helpers";
import { authRateLimit } from "@/lib/ratelimit";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export const POST = withErrorHandler(
  withRateLimit(authRateLimit)(
    async (req: Request) => {
      const { email, password, name, role, tenantId } = await req.json();

      if (!email || !password || !name) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      try {
        // Create user in Firebase Auth
        const userRecord = await adminAuth.createUser({
          email,
          password,
          displayName: name,
        });

        // Save extra data in Firestore
        await adminDb.collection("users").doc(userRecord.uid).set({
          email,
          name,
          role: role || "teacher",
          tenantId: tenantId || null,
          createdAt: new Date(),
        });

        return NextResponse.json({ success: true, uid: userRecord.uid });
      } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
  )
);
