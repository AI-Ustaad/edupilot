import { hostname } from "os";
import { eventBus } from "@/lib/events";
import { EventOutboxRepository } from "@/repositories/event-outbox.repository";
import { logger } from "@/lib/logger/logger";

export interface EventWorkerResult {
  claimed: number;
  completed: number;
  retried: number;
  deadLetters: number;
}

/**
 * Stateless, restart-safe outbox worker. Firestore transactions grant each
 * event a lease so many Vercel/QStash workers may poll concurrently.
 */
export class EventWorker {
  constructor(
    private readonly outbox = new EventOutboxRepository(),
    private readonly nodeId = process.env.VERCEL_REGION
      ? `${process.env.VERCEL_REGION}:${process.env.VERCEL_DEPLOYMENT_ID ?? hostname()}`
      : hostname()
  ) {}

  async processBatch(limit = 50): Promise<EventWorkerResult> {
    const events = await this.outbox.claimPending(limit, this.nodeId);
    const result: EventWorkerResult = { claimed: events.length, completed: 0, retried: 0, deadLetters: 0 };

    for (const event of events) {
      try {
        await eventBus.dispatchEvent(event);
        await this.outbox.complete(event.eventId, this.nodeId);
        result.completed++;
      } catch (error) {
        await this.outbox.fail(event, this.nodeId, error);
        if (event.attempts >= 5) result.deadLetters++;
        else result.retried++;
        logger.error("[EventWorker] Event processing failed", {
          metadata: { eventId: event.eventId, eventName: event.eventName, attempt: event.attempts, error },
        });
      }
    }

    return result;
  }
}
