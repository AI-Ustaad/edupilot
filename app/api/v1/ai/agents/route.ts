// app/api/v1/ai/agents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSessionUser } from "@/lib/auth/auth-server";
import { AgentService } from "@/services/ai/agent.service";

export const runtime = "nodejs";

const agentService = new AgentService();

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { agentType, context } = await req.json();

    // 🤖 Principal Agent
    if (agentType === "principal") {
      // ڈیٹا بیس سے اسکول کا اہم ڈیٹا جمع کریں
      const [studentsSnap, feesSnap, attendanceSnap] = await Promise.all([
        adminDb.collection("students").where("tenantId", "==", user.tenantId).get(),
        adminDb.collection("fees").where("tenantId", "==", user.tenantId).limit(100).get(),
        adminDb.collection("attendance").where("tenantId", "==", user.tenantId).limit(100).get(),
      ]);

      const schoolData = {
        totalStudents: studentsSnap.size,
        feesSummary: feesSnap.docs.map(d => d.data()),
        attendanceSummary: attendanceSnap.docs.map(d => d.data()),
        userQuery: context // پرنسپل کا سوال (Optional)
      };

      const insights = await agentService.principalAgent(schoolData);
      return NextResponse.json({ success: true, data: insights });
    }

    // 🤖 Teacher Agent
    if (agentType === "teacher") {
      const { topic, classGrade, subject } = context;
      const content = await agentService.teacherAgent(topic, classGrade, subject);
      return NextResponse.json({ success: true, data: content });
    }

    return NextResponse.json({ error: "Invalid agent type" }, { status: 400 });

  } catch (error: any) {
    console.error("AI Agent API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
