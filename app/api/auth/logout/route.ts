import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserFromSession } from "@/lib/auth-utils";
import { unauthorized } from "@/lib/rbac";

export async function POST() {
  try {
    const session = cookies().get("session")?.value;
    
    // 1. گارڈ سے چیک کروائیں کہ کیا یوزر کے پاس اصلی سیشن ہے؟
    const user = await getUserFromSession(session);
    if (!user) {
      return unauthorized(); // ہمارا نیا ٹول جو 401 دے گا
    }

    // 2. اگر سیشن ٹھیک ہے، تو اسے ڈیلیٹ کر دیں (Cookies صاف کریں)
    cookies().set("session", "", { maxAge: 0 });
    
    return NextResponse.json({ success: true, message: "Logged out securely." });
  } catch (error) {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
