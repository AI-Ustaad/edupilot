// app/api/v1/ai/chatbot/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth-server";
import { aiService } from "@/services/ai.service";
import * as Sentry from "@sentry/nextjs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { question } = await req.json();
    if (!question) return NextResponse.json({ error: "Question required" }, { status: 400 });

    // Call Central AI Service
    const answer = await aiService.chat(question, user.tenantId, user.uid, user.role);

    return NextResponse.json({ success: true, data: { answer } });

  } catch (error: any) {
    Sentry.captureException(error);
    console.error("[Chatbot API Error]:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
