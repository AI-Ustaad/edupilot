export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { withErrorHandler, withAuth, withTenant, withRateLimit } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createApiResponse } from "@/lib/response/apiResponse";
import { ChatbotService } from "@/services/ai/chatbot.service";

// 🛡️ محفوظ wrapper: اگر Redis موجود نہیں ہے تو Rate Limit کو bypass کرے گا
const safeRateLimit = (handler: Function) => async (req: Request, context: any) => {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return handler(req, context);
  }
  
  try {
    const { aiRateLimit } = await import("@/lib/ratelimit");
    // withRateLimit درست طریقے سے استعمال ہو رہا ہے
    return withRateLimit(aiRateLimit)(handler)(req, context);
  } catch (err) {
    console.error("Rate limit error:", err);
    return handler(req, context);
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
