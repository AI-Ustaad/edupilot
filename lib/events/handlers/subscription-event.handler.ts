// lib/events/handlers/subscription-event.handler.ts
import { EventHandler, DomainEvent, DomainEventEnvelope } from "../domain-events";
import { EVENTS } from "../events";

export class SubscriptionActivatedHandler implements EventHandler {
  canHandle(eventType: string): boolean {
    return eventType === EVENTS.SUBSCRIPTION_ACTIVATED;
  }

  async handle(event: DomainEvent, envelope: DomainEventEnvelope): Promise<void> {
    const { tenantId, planId } = event.payload;
    console.log(`[SubscriptionActivated] Tenant ${tenantId} activated plan ${planId}`);
  }
}

export class SubscriptionCanceledHandler implements EventHandler {
  canHandle(eventType: string): boolean {
    return eventType === EVENTS.SUBSCRIPTION_CANCELED;
  }

  async handle(event: DomainEvent, envelope: DomainEventEnvelope): Promise<void> {
    const { tenantId } = event.payload;
    console.log(`[SubscriptionCanceled] Tenant ${tenantId} canceled subscription`);
  }
}
