export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { withErrorHandler, withAuth, withRateLimit, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { aiRateLimit } from "@/lib/ratelimit";
import { ChatbotService } from "@/services/ai/chatbot.service";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createApiResponse } from "@/lib/response/apiResponse";

export const POST = withErrorHandler(
  withAuth(
    withRateLimit(aiRateLimit)(
      withTenant(
        withPermission(PERMISSIONS.settings.view)(async (req: Request, context: any) => {
          const { question } = await req.json();
          if (!question) {
            return NextResponse.json(createApiResponse(400, null, "Question required"), { status: 400 });
          }

          const service = new ChatbotService();
          const answer = await service.respond(question);
          
          return NextResponse.json(createApiResponse(200, { answer }));
        })
      )
    )
  )
);
