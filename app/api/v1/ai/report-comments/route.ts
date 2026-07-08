export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { AgentRegistry } from "@/lib/ai/agents/AgentRegistry";
import type { TenantContext } from "@/types/api";

const reportAgent = new AgentRegistry();

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: TenantContext) => {
      const body = await req.json();
      if (!body.studentName || !body.subject) {
        return createErrorResponse(400, "Missing required fields (studentName, subject)");
      }

      const query = `Write a personalized report card comment for ${body.studentName} (Class ${body.grade || "N/A"}, Subject ${body.subject}). Marks: ${body.marks || "N/A"}%, Attendance: ${body.attendance || "N/A"}%.`;
      const result = await reportAgent.execute("teacher", {
        tenantId,
        userId: user.uid,
        userRole: user.role,
        query,
      });

      return createSuccessResponse({ comment: result });
    })
  )
);
