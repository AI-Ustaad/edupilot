export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { withErrorHandler } from "@/route-helpers";

export const GET = withErrorHandler(async (req: NextRequest) => {
  // Fetch feature flags from Firestore securely
  const flagsSnapshot = await adminDb.collection("featureFlags").get();
  const flags: Record<string, boolean> = {};
  
  flagsSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data) {
      flags[doc.id] = data.enabled || false;
    }
  });

  return NextResponse.json({ 
    success: true, 
    data: flags 
  });
});
