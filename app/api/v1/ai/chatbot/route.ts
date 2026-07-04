// app/api/v1/ai/chatbot/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth-server";
import { ChatbotService } from "@/services/ai/chatbot.service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { question } = await req.json();
    if (!question) return NextResponse.json({ error: "Question required" }, { status: 400 });

    const service = new ChatbotService();
    const answer = await service.respond(question);
    
    return NextResponse.json({ success: true, data: { answer } });

  } catch (error: any) {
    console.error("[Chatbot API Error]:", error);
    return NextResponse.json(
      { success: false, error: "AI Service Error: " + error.message },
      { status: 500 }
    );
  }
}
