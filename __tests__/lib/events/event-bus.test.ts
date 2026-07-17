import { EventBus } from "@/lib/events/event-bus";
import { EVENTS } from "@/lib/events/event-types";
import { logger } from "@/lib/logger/logger";

jest.mock("@/lib/logger/logger", () => ({
  logger: { error: jest.fn() },
}));

describe("EventBus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("waits for every subscriber before resolving", async () => {
    const bus = new EventBus();
    let complete!: () => void;
    const received = new Promise<void>((resolve) => {
      complete = resolve;
    });
    const handler = jest.fn(async () => received);
    bus.subscribe(EVENTS.STUDENT_CREATED, handler);

    let published = false;
    const publishing = bus.dispatchHandlers(EVENTS.STUDENT_CREATED, { tenantId: "tenant-1" }).then(() => {
      published = true;
    });

    await Promise.resolve();
    expect(handler).toHaveBeenCalledWith({ tenantId: "tenant-1" });
    expect(published).toBe(false);

    complete();
    await publishing;
    expect(published).toBe(true);
  });

  it("isolates and logs a failing subscriber after all subscribers settle", async () => {
    const bus = new EventBus();
    const successfulHandler = jest.fn();
    bus.subscribe(EVENTS.FEE_COLLECTED, async () => {
      throw new Error("notification provider unavailable");
    });
    bus.subscribe(EVENTS.FEE_COLLECTED, successfulHandler);

    await expect(bus.dispatchHandlers(EVENTS.FEE_COLLECTED, { tenantId: "tenant-1" })).resolves.toBeUndefined();

    expect(successfulHandler).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining(EVENTS.FEE_COLLECTED),
      expect.objectContaining({ metadata: expect.objectContaining({ error: expect.any(Error) }) })
    );
  });
});
