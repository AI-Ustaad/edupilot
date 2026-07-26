// lib/events/event-middleware.ts
import { DomainEvent, DomainEventEnvelope, EventMiddleware } from "./domain-events";
import { logger } from "@/lib/logger/logger";

export class LoggingMiddleware implements EventMiddleware {
  async process(event: DomainEvent, envelope: DomainEventEnvelope, next: () => Promise<void>): Promise<void> {
    logger.info(`[EventBus] Dispatching ${event.eventType}`, {
      metadata: {
        eventId: event.eventId,
        tenantId: event.tenantId,
        aggregateId: event.aggregateId,
      },
    });
    
    try {
      await next();
      logger.info(`[EventBus] Successfully processed ${event.eventType}`, {
        metadata: { eventId: event.eventId },
      });
    } catch (error) {
      logger.error(`[EventBus] Failed to process ${event.eventType}`, {
        metadata: { eventId: event.eventId, error },
      });
      throw error;
    }
  }
}

export class MetricsMiddleware implements EventMiddleware {
  private metrics: Map<string, { count: number; errors: number; avgDuration: number }> = new Map();

  async process(event: DomainEvent, envelope: DomainEventEnvelope, next: () => Promise<void>): Promise<void> {
    const start = Date.now();
    const metric = this.metrics.get(event.eventType) || { count: 0, errors: 0, avgDuration: 0 };
    
    try {
      await next();
      const duration = Date.now() - start;
      metric.count++;
      metric.avgDuration = (metric.avgDuration + duration) / 2;
      this.metrics.set(event.eventType, metric);
    } catch (error) {
      metric.errors++;
      this.metrics.set(event.eventType, metric);
      throw error;
    }
  }

  getMetrics(eventType: string) {
    return this.metrics.get(eventType);
  }
}

export class RetryMiddleware implements EventMiddleware {
  constructor(private maxRetries = 3, private retryDelay = 1000) {}

  async process(event: DomainEvent, envelope: DomainEventEnvelope, next: () => Promise<void>): Promise<void> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        await next();
        return;
      } catch (error) {
        lastError = error as Error;
        envelope.attempts = attempt + 1;
        envelope.lastError = lastError.message;
        
        if (attempt < this.maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
        }
      }
    }
    
    throw lastError;
  }
}
