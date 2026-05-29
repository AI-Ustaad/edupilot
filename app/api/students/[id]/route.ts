import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { StudentService } from "@/services/student.service";
import { StudentRepository } from "@/repositories/student.repository";
import { logAction } from "@/lib/audit";

interface WithTenantContext {
  tenantId: string;
  user: {
    uid: string;
    email: string;
    role: string;
    tenantId: string;
  };
}

function getIdFromUrl(req: Request): string {
  const url = new URL(req.url);
  const segments = url.pathname.split("/");
  return segments[segments.length - 1];
}

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: WithTenantContext) => {
      const id = getIdFromUrl(req);

      const service = new StudentService(
        new StudentRepository()
      );

      const student = await service.getStudentById(
        id,
        tenantId
      );

      if (!student) {
        return createApiResponse(
          404,
          null,
          "Student not found"
        );
      }

      return createApiResponse(
        200,
        student
      );
    })
  )
);

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      async (
        req: Request,
        { tenantId, user }: WithTenantContext
      ) => {
        if (user.role !== "admin") {
          return createApiResponse(
            403,
            null,
            "Forbidden"
          );
        }

        const id = getIdFromUrl(req);
        const body = await req.json();

        const service = new StudentService(
          new StudentRepository()
        );

        await service.updateStudent(
          id,
          body,
          tenantId
        );

        return createApiResponse(
          200,
          null,
          "Student updated successfully"
        );
      }
    )
  )
);

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      async (
        req: Request,
        { tenantId, user }: WithTenantContext
      ) => {
        if (user.role !== "admin") {
          return createApiResponse(
            403,
            null,
            "Forbidden"
          );
        }

        const id = getIdFromUrl(req);

        const service = new StudentService(
          new StudentRepository()
        );

        const student =
          await service.getStudentById(
            id,
            tenantId
          );

        if (!student) {
          return createApiResponse(
            404,
            null,
            "Student not found"
          );
        }

        await service.deleteStudent(
          id,
          tenantId
        );

        await logAction({
          action: "STUDENT_DELETED",
          userId: user.uid,
          tenantId,
          entityId: id,
          entityType: "student",
          metadata: {
            name: student.fullName,
          },
        });

        return createApiResponse(
          200,
          null,
          "Student deleted successfully"
        );
      }
    )
  )
);
