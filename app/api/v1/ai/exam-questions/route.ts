// app/api/v1/ai/exam-questions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth-server";
import { aiService } from "@/services/ai/ai.service";
import * as Sentry from "@sentry/nextjs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    if (!body.className || !body.subject || !body.topic) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await aiService.generateExamQuestions(body, user.tenantId, user.uid, user.role);
    return NextResponse.json({ success: true, data: result });

  } catch (error: any) {
    Sentry.captureException(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
