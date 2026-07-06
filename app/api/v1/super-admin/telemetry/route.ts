// app/api/v1/super-admin/telemetry/route.ts
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth-server";
import { TelemetryService } from "@/services/telemetry.service";
import * as Sentry from "@sentry/nextjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // 🛡️ Force dynamic rendering because it uses cookies

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }

    const telemetryService = new TelemetryService();
    const metrics = await telemetryService.getSaaSMetrics();

    return NextResponse.json({ success: true, data: metrics });

  } catch (error: any) {
    Sentry.captureException(error);
    console.error("Telemetry API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
