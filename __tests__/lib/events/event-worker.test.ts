import { EventWorker } from "@/lib/workers/event.worker";
import { EVENT_STATUS, type DurableEvent } from "@/types/event";
import { EVENTS } from "@/lib/events/event-types";
import { eventBus } from "@/lib/events";

jest.mock("@/lib/events", () => ({ eventBus: { dispatch: jest.fn() } }));
jest.mock("@/lib/logger/logger", () => ({ logger: { error: jest.fn() } }));

const event = (attempts = 1): DurableEvent => ({
  eventId: "event-1",
  eventName: "student.created.v1",
  eventType: EVENTS.STUDENT_CREATED,
  eventVersion: 1,
  eventSchemaVersion: 1,
  aggregateType: "student",
  aggregateId: "student-1",
  tenantId: "tenant-1",
  payload: { tenantId: "tenant-1", studentId: "student-1" },
  metadata: { traceId: "trace-1", correlationId: "correlation-1" },
  traceId: "trace-1",
  correlationId: "correlation-1",
  status: EVENT_STATUS.PROCESSING,
  attempts,
  nextRetry: new Date(),
  retryHistory: [],
});

describe("EventWorker", () => {
  beforeEach(() => jest.clearAllMocks());

  it("completes each claimed event exactly once", async () => {
    const claimedEvent = event();
    const outbox = {
      claimPending: jest.fn().mockResolvedValue([claimedEvent]),
      complete: jest.fn().mockResolvedValue(undefined),
      fail: jest.fn(),
    };
    (eventBus.dispatch as jest.Mock).mockResolvedValue(undefined);

    const result = await new EventWorker(outbox as any, "worker-a").processBatch();

    expect(eventBus.dispatch).toHaveBeenCalledWith(claimedEvent);
    expect(outbox.complete).toHaveBeenCalledWith("event-1", "worker-a");
    expect(result).toEqual({ claimed: 1, completed: 1, retried: 0, deadLetters: 0 });
  });

  it("leaves failed delivery retryable and records a dead-letter outcome on the final attempt", async () => {
    const retryableOutbox = {
      claimPending: jest.fn().mockResolvedValue([event(2)]),
      complete: jest.fn(),
      fail: jest.fn().mockResolvedValue(undefined),
    };
    const terminalOutbox = {
      claimPending: jest.fn().mockResolvedValue([event(5)]),
      complete: jest.fn(),
      fail: jest.fn().mockResolvedValue(undefined),
    };
    (eventBus.dispatch as jest.Mock).mockRejectedValue(new Error("subscriber unavailable"));

    await expect(new EventWorker(retryableOutbox as any, "worker-a").processBatch()).resolves.toMatchObject({ retried: 1, deadLetters: 0 });
    await expect(new EventWorker(terminalOutbox as any, "worker-a").processBatch()).resolves.toMatchObject({ retried: 0, deadLetters: 1 });
    expect(retryableOutbox.fail).toHaveBeenCalledWith(expect.objectContaining({ attempts: 2 }), "worker-a", expect.any(Error));
    expect(terminalOutbox.fail).toHaveBeenCalledWith(expect.objectContaining({ attempts: 5 }), "worker-a", expect.any(Error));
  });
});
