// lib/events/handlers/student-event.handler.ts
import { EventHandler, DomainEvent, DomainEventEnvelope } from "../domain-events";
import { EventBus } from "../event-bus";
import { EVENTS } from "../events";

export class StudentCreatedHandler implements EventHandler {
  canHandle(eventType: string): boolean {
    return eventType === EVENTS.STUDENT_CREATED;
  }

  async handle(event: DomainEvent, envelope: DomainEventEnvelope): Promise<void> {
    const { studentId, tenantId } = event.payload;
    console.log(`[StudentCreated] Student ${studentId} created in tenant ${tenantId}`);
  }
}

export class StudentUpdatedHandler implements EventHandler {
  canHandle(eventType: string): boolean {
    return eventType === EVENTS.STUDENT_UPDATED;
  }

  async handle(event: DomainEvent, envelope: DomainEventEnvelope): Promise<void> {
    const { studentId, tenantId } = event.payload;
    console.log(`[StudentUpdated] Student ${studentId} updated in tenant ${tenantId}`);
  }
}

export class StudentDeletedHandler implements EventHandler {
  canHandle(eventType: string): boolean {
    return eventType === EVENTS.STUDENT_DELETED;
  }

  async handle(event: DomainEvent, envelope: DomainEventEnvelope): Promise<void> {
    const { studentId, tenantId } = event.payload;
    console.log(`[StudentDeleted] Student ${studentId} deleted in tenant ${tenantId}`);
  }
}
