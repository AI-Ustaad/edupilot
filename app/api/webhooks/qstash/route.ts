// app/api/webhooks/qstash/route.ts
import { NextResponse } from "next/server";
import { verifyQStashSignature } from "@/lib/qstash-verify";
import { runReportWorker } from "@/lib/workers/report.worker";
import { logger } from "@/lib/logger/logger";
import { EventWorker } from "@/lib/workers/event.worker";

// Vercel کو بتائیں کہ اس API کو ٹائم آؤٹ نہ کرے (Maximum allowed time for Hobby/Pro)
export const maxDuration = 300; // 5 minutes

export async function POST(req: Request) {
  try {
    // 1. Security Check: صرف اور صرف Upstash (QStash) اس API کو ہٹ کر سکتا ہے!
    await verifyQStashSignature(req);
    
    // 2. Parse the payload
    const body = await req.json();
    logger.info(`Webhook received job type: ${body.type}`);
    
    // 3. Route to the specific worker
    switch (body.type) {
      case "REPORT_GENERATION":
        await runReportWorker(body.data);
        break;
      case "EVENT_OUTBOX":
        await new EventWorker().processBatch(body.data?.limit ?? 50);
        break;
      // مستقبل میں: case "BULK_IMPORT": await runImportWorker(body.data); break;
      default:
        logger.warn(`No worker found for job type: ${body.type}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("Webhook Error:", { metadata: { error: error.message } });
    // 500 اسٹیٹس کوڈ واپس بھیجیں تاکہ QStash کو پتہ چلے کہ جاب فیل ہو گئی ہے اور وہ Retry کرے
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
