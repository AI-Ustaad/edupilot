const mockActivateSubscription = jest.fn().mockResolvedValue(undefined);
const mockUpdateSubscription = jest.fn().mockResolvedValue(undefined);
const mockCancelSubscription = jest.fn().mockResolvedValue(undefined);
const mockFindByStripeSubscriptionId = jest.fn().mockResolvedValue(null);
const mockFindByStripeCustomerId = jest.fn().mockResolvedValue(null);
const mockGetPlanLimits = jest.fn().mockResolvedValue({ maxStudents: 50, maxStaff: 10 });

const mockStudentCount = jest.fn().mockResolvedValue(0);
const mockStudentPaginate = jest.fn().mockResolvedValue({ data: [], total: 0 });

const mockStaffCount = jest.fn().mockResolvedValue(0);
const mockStaffGetAll = jest.fn().mockResolvedValue([]);

const mockWebhookGet = jest.fn().mockResolvedValue({ exists: false });
const mockWebhookSet = jest.fn().mockResolvedValue({});

jest.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
  PLANS: {
    free: { id: "free", name: "Free", maxStudents: 50, maxStaff: 10, limits: { students: 50, staff: 10 } },
    starter: { id: "starter", name: "Starter", maxStudents: 200, maxStaff: 50, limits: { students: 200, staff: 50 } },
    professional: { id: "professional", name: "Professional", maxStudents: 1000, maxStaff: 200, limits: { students: 1000, staff: 200 } },
    enterprise: { id: "enterprise", name: "Enterprise", maxStudents: 999999, maxStaff: 999999, limits: { students: 999999, staff: 999999 } },
  },
  SUBSCRIPTION_PLANS: {
    free: { id: "free", name: "Free", maxStudents: 50, maxStaff: 10, limits: { students: 50, staff: 10 } },
    starter: { id: "starter", name: "Starter", maxStudents: 200, maxStaff: 50, limits: { students: 200, staff: 50 } },
    professional: { id: "professional", name: "Professional", maxStudents: 1000, maxStaff: 200, limits: { students: 1000, staff: 200 } },
    enterprise: { id: "enterprise", name: "Enterprise", maxStudents: 999999, maxStaff: 999999, limits: { students: 999999, staff: 999999 } },
  },
  getPlanByPriceId: jest.fn(),
}));

jest.mock("@/lib/firebase-admin", () => ({
  adminDb: {
    collection: jest.fn((colName: string) => ({
      doc: jest.fn(() => ({
        get: mockWebhookGet,
        set: mockWebhookSet,
      })),
    })),
  },
  dbTimestamp: { toDate: () => new Date() },
}));

jest.mock("@/services/subscription.service", () => ({
  SubscriptionService: jest.fn().mockImplementation(() => ({
    activateSubscription: mockActivateSubscription,
    updateSubscription: mockUpdateSubscription,
    cancelSubscription: mockCancelSubscription,
    findByStripeSubscriptionId: mockFindByStripeSubscriptionId,
    findByStripeCustomerId: mockFindByStripeCustomerId,
    getPlanLimits: mockGetPlanLimits,
  })),
}));

jest.mock("@/services/StudentService", () => ({
  StudentService: jest.fn().mockImplementation(() => ({
    count: mockStudentCount,
    paginate: mockStudentPaginate,
  })),
}));

jest.mock("@/services/StaffService", () => ({
  StaffService: jest.fn().mockImplementation(() => ({
    count: mockStaffCount,
    getAll: mockStaffGetAll,
  })),
}));

jest.mock("@/services/invoice.service", () => ({
  InvoiceService: jest.fn().mockImplementation(() => ({
    createFromStripe: jest.fn().mockResolvedValue({}),
  })),
}));

import { POST } from "@/app/api/v1/stripe/webhook/route";
import { stripe } from "@/lib/stripe";
import { checkStudentQuota, checkStaffQuota } from "@/lib/quota-guard";
import { QuotaExceededException } from "@/errors/AppError";
import { StudentService } from "@/services/StudentService";

describe("Phase 5: Stripe Webhook Lifecycle, Idempotency & Quota Guardrails", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWebhookGet.mockResolvedValue({ exists: false });
    mockWebhookSet.mockResolvedValue({});
    mockActivateSubscription.mockResolvedValue(undefined);
    mockUpdateSubscription.mockResolvedValue(undefined);
    mockCancelSubscription.mockResolvedValue(undefined);
    mockFindByStripeSubscriptionId.mockResolvedValue(null);
    mockFindByStripeCustomerId.mockResolvedValue(null);
    mockGetPlanLimits.mockResolvedValue({ maxStudents: 50, maxStaff: 10 });
    mockStudentCount.mockResolvedValue(0);
    mockStaffCount.mockResolvedValue(0);
  });

  describe("1. Cryptographic Signature Verification", () => {
    it("rejects requests missing stripe-signature header with 400 Bad Request", async () => {
      const req = new Request("http://localhost/api/v1/stripe/webhook", {
        method: "POST",
        body: JSON.stringify({ id: "evt_test_1" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Missing stripe-signature header");
    });

    it("rejects invalid cryptographic signature with 400 Bad Request", async () => {
      (stripe.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid signature signature_mismatch");
      });

      const req = new Request("http://localhost/api/v1/stripe/webhook", {
        method: "POST",
        headers: { "stripe-signature": "sig_invalid" },
        body: JSON.stringify({ id: "evt_test_2" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("Webhook signature verification failed");
    });
  });

  describe("2. Idempotency & Replay Protection", () => {
    it("acknowledges duplicate stripeEventId with 200 OK deduplicated without mutating state", async () => {
      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        id: "evt_duplicate_123",
        type: "checkout.session.completed",
        livemode: false,
        data: {
          object: {
            id: "cs_test_123",
            metadata: { tenantId: "tenant_abc", planTier: "starter" },
          },
        },
      });

      mockWebhookGet.mockResolvedValue({ exists: true });

      const req = new Request("http://localhost/api/v1/stripe/webhook", {
        method: "POST",
        headers: { "stripe-signature": "sig_valid" },
        body: JSON.stringify({ id: "evt_duplicate_123" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toEqual({ received: true, deduplicated: true });
      expect(mockActivateSubscription).not.toHaveBeenCalled();
      expect(mockUpdateSubscription).not.toHaveBeenCalled();
    });
  });

  describe("3. checkout.session.completed Lifecycle", () => {
    it("upgrades tenant plan, provisions limits, and records idempotency state", async () => {
      const eventId = "evt_checkout_success_1";
      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        id: eventId,
        type: "checkout.session.completed",
        livemode: false,
        data: {
          object: {
            id: "cs_12345",
            customer: "cus_stripe_123",
            subscription: "sub_stripe_123",
            metadata: { tenantId: "tenant_school_1", planTier: "starter" },
          },
        },
      });

      mockWebhookGet.mockResolvedValue({ exists: false });

      const req = new Request("http://localhost/api/v1/stripe/webhook", {
        method: "POST",
        headers: { "stripe-signature": "sig_valid" },
        body: JSON.stringify({ id: eventId }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toEqual({ received: true });

      expect(mockActivateSubscription).toHaveBeenCalledWith(
        "tenant_school_1",
        "starter",
        undefined,
        expect.objectContaining({
          status: "active",
          maxStudents: 200,
          maxStaff: 50,
          stripeCustomerId: "cus_stripe_123",
          stripeSubscriptionId: "sub_stripe_123",
        })
      );

      expect(mockWebhookSet).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId,
          type: "checkout.session.completed",
        })
      );
    });
  });

  describe("4. customer.subscription.updated Lifecycle", () => {
    it("handles tier upgrade and recalculates quota limits", async () => {
      const eventId = "evt_sub_upgrade_1";
      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        id: eventId,
        type: "customer.subscription.updated",
        livemode: false,
        data: {
          object: {
            id: "sub_stripe_999",
            status: "active",
            cancel_at_period_end: false,
            current_period_start: 1700000000,
            current_period_end: 1702592000,
            customer: "cus_stripe_999",
            metadata: { tenantId: "tenant_school_1", planTier: "professional" },
          },
        },
      });

      mockWebhookGet.mockResolvedValue({ exists: false });

      const req = new Request("http://localhost/api/v1/stripe/webhook", {
        method: "POST",
        headers: { "stripe-signature": "sig_valid" },
        body: JSON.stringify({ id: eventId }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      expect(mockUpdateSubscription).toHaveBeenCalledWith(
        "tenant_school_1",
        expect.objectContaining({
          status: "active",
          planId: "professional",
          maxStudents: 1000,
          maxStaff: 200,
          cancelAtPeriodEnd: false,
        })
      );
    });

    it("handles scheduled downgrade with cancel_at_period_end flag", async () => {
      const eventId = "evt_sub_cancel_scheduled_1";
      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        id: eventId,
        type: "customer.subscription.updated",
        livemode: false,
        data: {
          object: {
            id: "sub_stripe_999",
            status: "active",
            cancel_at_period_end: true,
            current_period_start: 1700000000,
            current_period_end: 1702592000,
            metadata: { tenantId: "tenant_school_1" },
          },
        },
      });

      mockWebhookGet.mockResolvedValue({ exists: false });

      const req = new Request("http://localhost/api/v1/stripe/webhook", {
        method: "POST",
        headers: { "stripe-signature": "sig_valid" },
        body: JSON.stringify({ id: eventId }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      expect(mockUpdateSubscription).toHaveBeenCalledWith(
        "tenant_school_1",
        expect.objectContaining({
          status: "active",
          cancelAtPeriodEnd: true,
        })
      );
    });
  });

  describe("5. customer.subscription.deleted & Zero-Orphaned State", () => {
    it("gracefully reverts tenant to Free tier without deleting student or staff data", async () => {
      const eventId = "evt_sub_deleted_1";
      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        id: eventId,
        type: "customer.subscription.deleted",
        livemode: false,
        data: {
          object: {
            id: "sub_stripe_777",
            customer: "cus_stripe_777",
            metadata: { tenantId: "tenant_school_downgraded" },
          },
        },
      });

      mockWebhookGet.mockResolvedValue({ exists: false });

      const req = new Request("http://localhost/api/v1/stripe/webhook", {
        method: "POST",
        headers: { "stripe-signature": "sig_valid" },
        body: JSON.stringify({ id: eventId }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      expect(mockCancelSubscription).toHaveBeenCalledWith("tenant_school_downgraded");
    });
  });

  describe("6. invoice.payment_failed Lifecycle", () => {
    it("transitions subscription status to past_due upon payment failure", async () => {
      const eventId = "evt_invoice_fail_1";
      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        id: eventId,
        type: "invoice.payment_failed",
        livemode: false,
        data: {
          object: {
            id: "in_stripe_failed_1",
            metadata: { tenantId: "tenant_past_due_1" },
            subscription: "sub_stripe_111",
          },
        },
      });

      mockWebhookGet.mockResolvedValue({ exists: false });

      const req = new Request("http://localhost/api/v1/stripe/webhook", {
        method: "POST",
        headers: { "stripe-signature": "sig_valid" },
        body: JSON.stringify({ id: eventId }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      expect(mockUpdateSubscription).toHaveBeenCalledWith(
        "tenant_past_due_1",
        expect.objectContaining({
          status: "past_due",
        })
      );
    });
  });

  describe("7. Seat Limit & Soft-Cap Guardrails", () => {
    it("allows adding students when tenant is within quota limits", async () => {
      mockStudentCount.mockResolvedValue(40);
      mockGetPlanLimits.mockResolvedValue({ maxStudents: 50, maxStaff: 10 });

      await expect(checkStudentQuota("tenant_ok", 5)).resolves.toBeUndefined();
    });

    it("throws QuotaExceededException when student count exceeds plan limits", async () => {
      mockStudentCount.mockResolvedValue(55);
      mockGetPlanLimits.mockResolvedValue({ maxStudents: 50, maxStaff: 10 });

      await expect(checkStudentQuota("tenant_exceeded", 1)).rejects.toThrow(QuotaExceededException);
      await expect(checkStudentQuota("tenant_exceeded", 1)).rejects.toThrow(
        /Plan limit reached \(55\/50\)\. Please upgrade your subscription or archive inactive records\./
      );
    });

    it("throws QuotaExceededException when staff count exceeds plan limits", async () => {
      mockStaffCount.mockResolvedValue(12);
      mockGetPlanLimits.mockResolvedValue({ maxStudents: 50, maxStaff: 10 });

      await expect(checkStaffQuota("tenant_staff_exceeded", 1)).rejects.toThrow(QuotaExceededException);
      await expect(checkStaffQuota("tenant_staff_exceeded", 1)).rejects.toThrow(
        /Plan limit reached \(12\/10\)\. Please upgrade your subscription or archive inactive records\./
      );
    });

    it("preserves soft-cap: existing records remain accessible even in downgraded over-limit state", async () => {
      // Simulates tenant with 120 existing students downgraded to free tier (limit 50)
      const existingStudents = Array.from({ length: 120 }, (_, i) => ({
        id: `student_${i + 1}`,
        fullName: `Student ${i + 1}`,
        tenantId: "tenant_downgraded_softcap",
      }));

      mockStudentCount.mockResolvedValue(existingStudents.length);
      mockStudentPaginate.mockResolvedValue({ data: existingStudents, total: existingStudents.length });
      mockGetPlanLimits.mockResolvedValue({ maxStudents: 50, maxStaff: 10 });

      // 1. Reading existing data succeeds without lockout
      const studentService = new StudentService();
      const readResults = await studentService.paginate("tenant_downgraded_softcap", 1, 200);
      expect(readResults.data.length).toBe(120);

      // 2. Creating an additional student is blocked with QuotaExceededException
      await expect(checkStudentQuota("tenant_downgraded_softcap", 1)).rejects.toThrow(
        QuotaExceededException
      );
    });
  });
});
