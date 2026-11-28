export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { agentRegistry } from "@/lib/ai/agents/AgentRegistry";
import { enforceAiQuota, createAiErrorResponse, recordAiTelemetry } from "@/lib/ai/ai-quota-guard";
import { adminDb } from "@/lib/firebase-admin";
import type { TenantContext } from "@/types/api";

// B18 (26 Nov 2026 audit) — the Smart Book Center must be grounded on the
// real Book Center catalogue. Two defects:
//  1. The AI prompt only ever received the COUNT of books, never the titles,
//     so the AI could not show or recommend the actual catalogued books.
//  2. The catch-block fallback hardcoded "no physical or digital books
//     cataloged" even when books existed — so whenever the AI provider
//     failed (e.g. Gemini 503 / quota), the page falsely claimed an empty
//     catalogue although a book was saved and listed in Book Center.
function formatCatalogLine(book: any): string {
  const title = String(book?.title || "Untitled").trim();
  const author = book?.author ? ` by ${book.author}` : "";
  const subject = book?.subject ? ` — ${book.subject}` : "";
  const grade = book?.classGrade ? ` (Class ${book.classGrade})` : "";
  return `• ${title}${author}${subject}${grade}`;
}

function catalogSection(books: any[]): string {
  return `Books currently in your school library catalog:\n${books.map(formatCatalogLine).join("\n")}`;
}

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

      // Ground every answer on the real Book Center catalogue (same
      // `books` collection + `tenantId` the Books API uses).
      const booksSnap = await adminDb.collection("books").where("tenantId", "==", tenantId).get().catch(() => ({ docs: [] } as any));
      const activeBooks = (booksSnap.docs || [])
        .filter((d: any) => !d.data()?.deleted)
        .map((d: any) => d.data());
      const bookCount = activeBooks.length;

      const libraryContext = bookCount > 0
        ? `The school library has ${bookCount} book(s) cataloged in its physical/digital collection. These are the ONLY books in the school library — recommend from this list only and name them in your answer. Do NOT invent or claim any other book is in the library.\n${catalogSection(activeBooks)}`
        : `There are currently 0 physical or digital books cataloged in the school library collection. Explicitly state this fact first before suggesting curriculum reading materials. Do NOT claim books are currently in the school library.`;

      try {
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
        if (bookCount > 0) {
          // Guarantee the real catalogue is shown even if the AI answer
          // omits the catalogued books — the B18 acceptance is that a book
          // in Book Center is visible in the Smart Book Center.
          const mentionsCataloguedBook = activeBooks.some((b: any) => {
            const title = String(b?.title || "").trim();
            return title.length > 0 && result.toLowerCase().includes(title.toLowerCase());
          });
          if (!mentionsCataloguedBook) {
            result = `${result ? `${result}\n\n` : ""}${catalogSection(activeBooks)}`;
          }
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
        // Fallback grounded on the real catalogue: never claim "no books"
        // when books exist, and never present suggestions as if they were
        // in the library when the catalogue is empty.
        const gradeStr = body.grade ? `for ${body.grade}` : "for school curriculum";
        const fallback = bookCount > 0
          ? `The AI service is temporarily unavailable, so here are the books actually cataloged in your school library:\n\n${catalogSection(activeBooks)}\n\nPlease try again shortly for AI recommendations based on this catalog.`
          : `Currently, there are no physical or digital books cataloged in the school library catalog.\n\nSuggested curriculum resources ${gradeStr} (Punjab Curriculum & Textbook Board Standard) — these are suggestions to acquire, they are NOT currently in the school library:\n1. Punjab Textbook Board (PCTB) Official Curriculum Reader (${body.grade || "Primary / Middle"})\n2. Oxford Reading Tree & Progressive English Series\n3. Illustrated General Science & Mathematical Fundamentals Workbook\n\nThese curriculum recommendations can be used for lesson planning or cataloged into the school library.`;

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
