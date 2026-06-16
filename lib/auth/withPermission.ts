import { NextResponse } from "next/server";
import { Permission } from "@/lib/auth/permissions";
import { ROLE_PERMISSIONS, Role } from "@/lib/auth/roles";

// یہ Next.js App Router (app/api/...) کے لیے ایک HOF (Higher Order Function) ہے
export function withPermission(requiredPermission: Permission, handler: Function) {
  return async (req: Request, context: any) => {
    try {
      // 1. یہاں آپ اپنے AuthContext یا Firebase Admin سے یوزر کا سیشن / ٹوکن حاصل کریں گے
      // (فرض کریں کہ context.user میں لاگ ان یوزر کی معلومات آ رہی ہیں)
      const user = context.user; 

      if (!user || !user.role) {
        return NextResponse.json(
          { success: false, message: "Unauthorized: Missing credentials" },
          { status: 401 }
        );
      }

      // 2. یوزر کا رول نکالیں اور اس کی پرمیشنز چیک کریں
      const userRole = user.role as Role;
      const userPermissions = ROLE_PERMISSIONS[userRole] || [];

      // 3. اگر پرمیشن موجود نہیں، تو 403 Forbidden کا ایرر دے دیں
      if (!userPermissions.includes(requiredPermission)) {
        return NextResponse.json(
          { 
            success: false, 
            message: `Forbidden: You lack the '${requiredPermission}' permission.` 
          },
          { status: 403 }
        );
      }

      // 4. پرمیشن موجود ہے، تو اصل API چلنے دیں
      return handler(req, context);

    } catch (error) {
      console.error("Permission check failed:", error);
      return NextResponse.json(
        { success: false, message: "Internal Server Error during authorization." },
        { status: 500 }
      );
    }
  };
}
