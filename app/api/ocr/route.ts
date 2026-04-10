export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  if (!adminAuth) {
    return NextResponse.json({ error: "Firebase Admin is not configured." }, { status: 500 });
  }

  const session = cookies().get("session")?.value;

  if (!session) {
    return NextResponse.json({ error: "Access Denied: No secure session found!" }, { status: 401 });
  }

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(session, true);
    const userId = decodedClaims.uid; 

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded for OCR" }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "OCR Processed Securely!",
      uploadedBy: userId,
    });

  } catch (error) {
    console.error("OCR API Security Error:", error);
    return NextResponse.json({ error: "Invalid session or OCR processing failed." }, { status: 401 });
  }
}
