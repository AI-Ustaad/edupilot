export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { ChatbotService } from "@/services/ai/chatbot.service";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createApiResponse } from "@/lib/response/apiResponse";

// Rate limit کو محفوظ طریقے سے ہینڈل کرنے کے لیے wrapper
const safeRateLimit = (handler: Function) => async (req: Request, context: any) => {
  try {
    // اگر Upstash Redis موجود نہیں ہے تو یہ ڈائریکٹ handler کو کال کرے گا
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return handler(req, context);
    }
    // اگر Redis موجود ہے تو Rate Limit چیک کرے گا
    const { aiRateLimit } = await import("@/lib/ratelimit");
    return aiRateLimit(handler)(req, context);
  } catch (err) {
    console.error("Rate limit error:", err);
    return handler(req, context); // Rate limit fail ہو تو بھی request کو آگے بھیجے
  }
};

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.chat.send)(
        safeRateLimit(async (req: Request, context: any) => {
          const { question } = await req.json();
          if (!question) {
            return NextResponse.json(createApiResponse(400, null, "Question required"), { status: 400 });
          }

          try {
            const service = new ChatbotService();
            const answer = await service.respond(question);
            return NextResponse.json(createApiResponse(200, { answer }));
          } catch (err: any) {
            console.error("[AI Chatbot API Error]:", err.message);
            return NextResponse.json(
              createApiResponse(500, null, `AI Service Error: ${err.message || "Failed to generate response"}`),
              { status: 500 }
            );
          }
        })
      )
    )
  )
);
