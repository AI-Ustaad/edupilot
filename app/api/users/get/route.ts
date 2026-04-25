import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserFromSession } from "@/lib/auth-utils";

export async function GET() {
  try {
    const session = cookies().get("session")?.value;
    
    // ہمارے نئے ٹول سے یوزر کا رول اور ڈیٹا نکالیں
    const user = await getUserFromSession(session);

    if (!user || !user.role) {
      return NextResponse.json({ error: "Unauthorized or Role missing" }, { status: 401 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
