export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { agentRegistry } from "@/lib/ai/agents/AgentRegistry";
import { enforceAiQuota, createAiErrorResponse, recordAiTelemetry } from "@/lib/ai/ai-quota-guard";
import type { TenantContext } from "@/types/api";
import { formatClassLabel } from "@/lib/utils/formatClassLabel";
import { stripMarkdown } from "@/components/ui/FormattedAiText";

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: TenantContext) => {
      // AI Quota & Burst Rate Limit Guard
      const quotaCheck = await enforceAiQuota(user, "report-comments");
      if (!quotaCheck.allowed) {
        return createAiErrorResponse(quotaCheck);
      }

      const body = await req.json().catch(() => ({}));
      if (!body.studentName || !body.subject) {
        return createErrorResponse(400, "Missing required fields (studentName, subject)");
      }

      const gradeLabel = formatClassLabel(body.grade || "N/A");
      const query = `Write a personalized report card remark for ${body.studentName} (${gradeLabel}, Subject: ${body.subject}). Marks: ${body.marks || "N/A"}%, Attendance: ${body.attendance || "N/A"}%. Output ONLY 2-3 polished, encouragement-focused sentences of plain prose. Do NOT include any markdown characters, asterisks, bullet points, hashtags, or quotation marks. Output clean sentences ready to print directly on a report card.`;

      const startTime = Date.now();
      try {
        const result = await agentRegistry.execute("teacher", {
          tenantId,
          userId: user.uid,
          userRole: user.role,
          query,
        });

        await recordAiTelemetry({
          tenantId,
          userId: user.uid,
          featureKey: "report-comments",
          latencyMs: Date.now() - startTime,
          success: true,
        });

        const cleanComment = stripMarkdown(String(result || ""));
        return createSuccessResponse({ comment: cleanComment });
      } catch (err: any) {
        await recordAiTelemetry({
          tenantId,
          userId: user.uid,
          featureKey: "report-comments",
          latencyMs: Date.now() - startTime,
          success: false,
          error: err.message,
        });

        return createErrorResponse(500, "Report comments generator is temporarily unavailable.");
      }
    })
  )
);
