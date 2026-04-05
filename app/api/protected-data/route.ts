import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export async function GET() {
  const session = cookies().get("session")?.value;

  if (!session) {
    return NextResponse.json({ error: "Unauthorized: No session cookie" }, { status: 401 });
  }

  try {
    // Verify the session cookie
    const decodedClaims = await adminAuth.verifySessionCookie(session, true);
    
    // User is authenticated. You can use decodedClaims.uid to fetch user-specific data
    return NextResponse.json({ 
      success: true, 
      message: "Access granted to secure data",
      uid: decodedClaims.uid 
    });

  } catch (error) {
    return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
  }
}
