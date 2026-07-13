import { NextResponse } from "next/server";
import { EventWorker } from "@/lib/workers/event.worker";
import { logger } from "@/lib/logger/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Vercel Cron entry point. QStash may use the equivalent signed webhook. */
export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const batchSize = Math.min(Math.max(Number(new URL(request.url).searchParams.get("limit") ?? 50), 1), 200);
    const result = await new EventWorker().processBatch(batchSize);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    logger.error("[EventWorker] Scheduled execution failed", { metadata: { error } });
    return NextResponse.json({ error: "Event worker failed" }, { status: 500 });
  }
}
