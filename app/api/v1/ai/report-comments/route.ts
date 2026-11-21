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
      const marksNum = Number(body.marks) || 0;
      const attendanceNum = Number(body.attendance) || 0;

      // Deterministic personalized fallback generator
      const generateDeterministicComment = () => {
        const student = body.studentName.trim();
        const subject = body.subject.trim();
        if (marksNum >= 80) {
          return `${student} has demonstrated exceptional academic performance in ${gradeLabel} with outstanding mastery in ${subject}. Their consistent diligence, critical thinking, and active classroom participation reflect true academic excellence. With strong attendance of ${attendanceNum || 95}%, they set an inspiring standard for their peers.`;
        } else if (marksNum >= 60) {
          return `${student} has made steady academic progress this term, exhibiting a solid grasp of core concepts in ${gradeLabel} for ${subject}. With focused revision on challenging topics and continued regular attendance (${attendanceNum || 85}%), they are well-positioned to achieve even higher grades.`;
        } else {
          return `${student} displays encouraging potential and active enthusiasm in ${gradeLabel}. Targeted reinforcement in fundamental topics for ${subject} and dedicated daily study will significantly boost their performance. Improving regular attendance will further support their academic growth.`;
        }
      };

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

        const raw = String(result || "").trim();
        const cleanComment = raw ? stripMarkdown(raw) : generateDeterministicComment();
        return createSuccessResponse({ comment: cleanComment });
      } catch (err: any) {
        // Log telemetry and provide high-quality personalized deterministic fallback so teacher is never blocked
        await recordAiTelemetry({
          tenantId,
          userId: user.uid,
          featureKey: "report-comments",
          latencyMs: Date.now() - startTime,
          success: false,
          error: err.message,
        });

        const fallbackComment = generateDeterministicComment();
        return createSuccessResponse({ comment: stripMarkdown(fallbackComment) });
      }
    })
  )
);
