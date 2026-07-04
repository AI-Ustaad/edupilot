// app/api/v1/ai/agents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSessionUser } from "@/lib/auth/auth-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "AI Service not configured." }, { status: 503 });
    }

    const { agentType, context } = await req.json();

    if (agentType === "principal") {
      const [studentsSnap, feesSnap, attendanceSnap] = await Promise.all([
        adminDb.collection("students").where("tenantId", "==", user.tenantId).get(),
        adminDb.collection("fees").where("tenantId", "==", user.tenantId).limit(100).get(),
        adminDb.collection("attendance").where("tenantId", "==", user.tenantId).limit(100).get(),
      ]);

      const schoolData = {
        totalStudents: studentsSnap.size,
        feesSummary: feesSnap.docs.map(d => d.data()),
        attendanceSummary: attendanceSnap.docs.map(d => d.data()),
        userQuery: context
      };

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const systemPrompt = `You are the Principal Agent for EduPilot. Analyze school data and provide executive summary, risks, and recommendations.\nData: ${JSON.stringify(schoolData)}`;

      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: "Provide insights." }] }]
        })
      });

      const data = await response.json();
      const insights = data.candidates?.[0]?.content?.parts?.[0]?.text || "No insights generated.";
      
      return NextResponse.json({ success: true, data: insights });
    }

    return NextResponse.json({ error: "Invalid agent type" }, { status: 400 });

  } catch (error: any) {
    console.error("AI Agent API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
