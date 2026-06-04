// app/api/students/route.ts
import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withLogging } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { StudentService } from "@/services/student.service";
import { StudentRepository } from "@/repositories/student.repository";
import { updateTenantStats } from "@/lib/stats"; // <-- نیا اضافہ

interface WithTenantContext {
  tenantId: string;
  user: {
    uid: string;
    email: string;
    role: string;
    tenantId: string;
  };
}

export const GET = withErrorHandler(
  withLogging(
    withAuth(
      withTenant(async (req: Request, { tenantId }: WithTenantContext) => {
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "20");
        const service = new StudentService(new StudentRepository(adminDb));
        const result = await service.listStudents(tenantId, page, limit);
        return createApiResponse(200, result.data, undefined, {
          page,
          limit,
          total: result.total,
        });
      })
    )
  )
);

export const POST = withErrorHandler(
  withLogging(
    withAuth(
      withTenant(async (req: Request, { tenantId, user }: WithTenantContext) => {
        if (user.role !== "admin") {
          return createApiResponse(403, null, "Forbidden");
        }
        const body = await req.json();
        const service = new StudentService(new StudentRepository(adminDb));
        
        // 1. نیا طالب علم بنائیں
        const student = await service.createStudent(body, tenantId);

        // 2. 🔥 جادو: فائر بیس کا کوٹہ بچانے کے لیے اسٹوڈنٹ کاؤنٹ میں +1 کریں
        await updateTenantStats(tenantId, 'students', 1);

        return createApiResponse(201, student, "Student created successfully");
      })
    )
  )
);
