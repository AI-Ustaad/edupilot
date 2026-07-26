import { SubscriptionRepository } from "@/repositories/subscription.repository";

jest.mock("@/lib/firebase-admin", () => ({
  adminDb: {
    collection: jest.fn(),
  },
  dbTimestamp: { toDate: () => new Date() },
}));

jest.mock("@/lib/cache", () => ({
  invalidateCache: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/events/event-bus", () => ({
  eventBus: {
    publish: jest.fn().mockResolvedValue(undefined),
    dispatchHandlers: jest.fn().mockResolvedValue(undefined),
    dispatch: jest.fn().mockResolvedValue(undefined),
    dispatchEvent: jest.fn().mockResolvedValue(undefined),
  },
  EventBus: jest.fn(),
}));

jest.mock("@/lib/events/event-types", () => ({
  EVENTS: {
    SUBSCRIPTION_ACTIVATED: "subscription.activated",
    SUBSCRIPTION_CANCELED: "subscription.canceled",
  },
}));

describe("SubscriptionRepository", () => {
  let repo: SubscriptionRepository;
  let mockCollection: jest.Mock;
  let mockDoc: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    const adminDb = require("@/lib/firebase-admin").adminDb;
    mockCollection = adminDb.collection as jest.Mock;
    mockDoc = jest.fn();
    
    mockCollection.mockReturnValue({
      doc: mockDoc,
      add: jest.fn().mockResolvedValue({ id: "new-id" }),
      get: jest.fn().mockResolvedValue({ docs: [] }),
      update: jest.fn().mockResolvedValue({}),
      batch: jest.fn(() => ({
        set: jest.fn(),
        commit: jest.fn().mockResolvedValue([]),
      })),
    });

    repo = new SubscriptionRepository();
  });

  it("findByTenant returns null when subscription does not exist", async () => {
    mockDoc.mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: false }),
    });

    const result = await repo.findByTenant("tenant-123");
    expect(result).toBeNull();
  });

  it("findByTenant returns subscription when exists", async () => {
    mockDoc.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        exists: true,
        id: "sub-123",
        data: jest.fn().mockReturnValue({ planId: "pro", status: "active" }),
      }),
    });

    const result = await repo.findByTenant("tenant-123");
    expect(result).toBeDefined();
    expect(result?.planId).toBe("pro");
    expect(result?.status).toBe("active");
  });

  it("activate creates subscription with correct data", async () => {
    const mockSet = jest.fn().mockResolvedValue({ id: "new-sub" });
    mockDoc.mockReturnValue({
      set: mockSet,
    });

    await repo.activate("tenant-123", "enterprise", "user-456");
    expect(mockDoc).toHaveBeenCalledWith("tenant-123");
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: "enterprise",
        status: "active",
        tenantId: "tenant-123",
      }),
      { merge: true }
    );
  });

  it("cancel updates subscription to free plan", async () => {
    const mockSet = jest.fn().mockResolvedValue({});
    mockDoc.mockReturnValue({
      set: mockSet,
    });

    await repo.cancel("tenant-123", "user-456");
    expect(mockDoc).toHaveBeenCalledWith("tenant-123");
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: "free",
        status: "canceled",
      }),
      { merge: true }
    );
  });
});
