// app/api/v1/ai/agents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSessionUser } from "@/lib/auth/auth-server";
import { aiService } from "@/services/ai/ai.service";
import * as Sentry from "@sentry/nextjs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { agentType, context } = await req.json();

    if (agentType === "principal") {
      // Fetch School Data for Principal Agent
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

      const insights = await aiService.principalAgent(schoolData, user.tenantId, user.uid, user.role);
      return NextResponse.json({ success: true, data: insights });
    }

    return NextResponse.json({ error: "Invalid agent type" }, { status: 400 });

  } catch (error: any) {
    Sentry.captureException(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
