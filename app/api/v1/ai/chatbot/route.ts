// app/api/v1/ai/chatbot/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // 1. Auth Check
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 2. Gemini API Key Check
    if (!process.env.GEMINI_API_KEY) {
      console.error("[AI Chatbot] GEMINI_API_KEY is missing.");
      return NextResponse.json(
        { success: false, error: "AI Service is not configured." },
        { status: 503 }
      );
    }

    const { question } = await req.json();
    if (!question) {
      return NextResponse.json({ success: false, error: "Question required" }, { status: 400 });
    }

    // 3. Call Google Gemini API directly (No Upstash, No complex wrappers)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: "You are EduPilot AI, a helpful school management assistant. Answer concisely." }]
        },
        contents: [{ role: "user", parts: [{ text: question }] }],
        generationConfig: { temperature: 0.7 }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[Gemini API Error]:", errorData);
      return NextResponse.json(
        { success: false, error: errorData.error?.message || "AI Error" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";

    return NextResponse.json({ success: true, data: { answer } });

  } catch (error: any) {
    // Sentry کو خودکار Error بھیجے گا، لیکن یہاں سے واضح Response جائے گا
    console.error("[Chatbot API Error]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
