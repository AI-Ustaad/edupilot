import { NextResponse } from "next/server";

// جب یوزر لاگ ان نہ ہو یا سیشن ایکسپائر ہو جائے
export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized: Please log in." }, { status: 401 });
}

// جب یوزر لاگ ان ہو لیکن اس کا رول (مثلاً ٹیچر) اس پیج کی اجازت نہ دے
export function forbidden() {
  return NextResponse.json({ error: "Forbidden: You do not have permission." }, { status: 403 });
}

// یہ ٹول چیک کرے گا کہ کیا یوزر کے رول کو اجازت ہے؟
export function allowRoles(userRole: string, allowed: string[]) {
  if (!userRole) return false;
  return allowed.includes(userRole);
}
