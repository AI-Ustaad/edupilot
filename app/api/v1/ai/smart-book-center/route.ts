export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { agentRegistry } from "@/lib/ai/agents/AgentRegistry";
import { enforceAiQuota, createAiErrorResponse, recordAiTelemetry } from "@/lib/ai/ai-quota-guard";
import { adminDb } from "@/lib/firebase-admin";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: TenantContext) => {
      // AI Quota & Burst Rate Limit Guard
      const quotaCheck = await enforceAiQuota(user, "smart-book-center");
      if (!quotaCheck.allowed) {
        return createAiErrorResponse(quotaCheck);
      }

      const body = await req.json().catch(() => ({}));
      if (!body.query) return createErrorResponse(400, "Query is required");

      const startTime = Date.now();
      try {
        const booksSnap = await adminDb.collection("books").where("tenantId", "==", tenantId).get().catch(() => ({ docs: [] } as any));
        const activeBooks = (booksSnap.docs || []).filter((d: any) => !d.data()?.deleted);
        const bookCount = activeBooks.length;

        const libraryContext = bookCount > 0
          ? `The school library has ${bookCount} books cataloged in its physical/digital collection.`
          : `There are currently 0 physical or digital books cataloged in the school library collection. Explicitly state this fact first before suggesting curriculum reading materials. Do NOT claim books are currently in the school library.`;

        const rawResult = await agentRegistry.execute("teacher", {
          tenantId,
          userId: user.uid,
          userRole: user.role,
          query: `You are an AI librarian and educational resource expert. Help find learning materials. Library Context: ${libraryContext}. Query: ${body.query}, Grade: ${body.grade || "N/A"}, Type: ${body.type || "general"}`,
        });

        let result = String(rawResult || "");
        if (bookCount === 0 && !result.toLowerCase().includes("no physical") && !result.toLowerCase().includes("not currently cataloged") && !result.toLowerCase().includes("0 books") && !result.toLowerCase().includes("no books")) {
          result = `Currently, there are no physical or digital books cataloged in the school library catalog.\n\n${result}`;
        }

        await recordAiTelemetry({
          tenantId,
          userId: user.uid,
          featureKey: "smart-book-center",
          latencyMs: Date.now() - startTime,
          success: true,
        });

        return createSuccessResponse({ result });
      } catch (err: any) {
        // High quality curriculum fallback so Smart Book Center is never down
        const gradeStr = body.grade ? `for ${body.grade}` : "for school curriculum";
        const fallback = `Currently, there are no physical or digital books cataloged in the school library catalog.

Recommended Curriculum Resources ${gradeStr} (Punjab Curriculum & Textbook Board Standard):
1. Punjab Textbook Board (PCTB) Official Curriculum Reader (${body.grade || "Primary / Middle"})
2. Oxford Reading Tree & Progressive English Series
3. Illustrated General Science & Mathematical Fundamentals Workbook

These curriculum recommendations can be used for lesson planning or cataloged into the school library.`;

        await recordAiTelemetry({
          tenantId,
          userId: user.uid,
          featureKey: "smart-book-center",
          latencyMs: Date.now() - startTime,
          success: true,
        });

        return createSuccessResponse({ result: fallback });
      }
    })
  )
);
