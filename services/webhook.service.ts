import { verifyQStashSignature } from "@/lib/qstash-verify";
import { EventWorker } from "@/lib/workers/event.worker";
import { EventOutboxRepository } from "@/repositories/event-outbox.repository";
import { logger } from "@/lib/logger/logger";
import type { IWebhookService } from "@/interfaces/IWebhookService";

export class WebhookService implements IWebhookService {
  private eventOutboxRepo: EventOutboxRepository;

  constructor(eventOutboxRepo?: EventOutboxRepository) {
    this.eventOutboxRepo = eventOutboxRepo ?? new EventOutboxRepository();
  }

  async verifySignature(payload: any, signature: string): Promise<boolean> {
    const req = new Request("https://placeholder", {
      method: "POST",
      headers: { "upstash-signature": signature },
      body: JSON.stringify(payload),
    });
    await verifyQStashSignature(req);
    return true;
  }

  async processEvent(event: { type: string; data: any }): Promise<any> {
    const worker = new EventWorker(this.eventOutboxRepo);
    return worker.processBatch(event.data?.limit ?? 50);
  }

  async routeEvent(eventType: string, payload: any): Promise<void> {
    switch (eventType) {
      case "REPORT_GENERATION":
        const { runReportWorker } = await import("@/lib/workers/report.worker");
        await runReportWorker(payload);
        break;
      case "EVENT_OUTBOX":
        await this.processEvent({ type: eventType, data: payload });
        break;
      default:
        logger.warn(`No handler found for webhook event type: ${eventType}`);
    }
  }
}

export const webhookService = new WebhookService();
