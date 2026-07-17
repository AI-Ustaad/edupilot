// __tests__/integration/enterprise-workflows.test.ts
// Enterprise E2E Integration Tests for Critical User Journeys

import { NextRequest } from "next/server";
import { POST as agentPOST, GET as agentListGET } from "@/app/api/v1/ai/agents/route";
import { POST as ocrPOST } from "@/app/api/v1/staff/ocr/route";
import { getSessionUser } from "@/lib/auth/auth-server";

// ============================================================
// Mocks
// ============================================================

jest.mock("@/lib/auth/auth-server");
jest.mock("@/lib/firebase-admin", () => ({
  adminDb: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ docs: [], exists: false, data: () => ({}) }),
    add: jest.fn().mockResolvedValue({ id: "mock-id" }),
    set: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
  },
  adminAuth: {
    createSessionCookie: jest.fn().mockResolvedValue("mock-session-cookie"),
    verifySessionCookie: jest.fn().mockResolvedValue({ uid: "admin-uid", email: "admin@school.com" }),
    verifyIdToken: jest.fn().mockResolvedValue({ uid: "admin-uid", email: "admin@school.com" }),
  },
}));

jest.mock("@/lib/ai/providers/GeminiProvider", () => {
  return {
    GeminiProvider: jest.fn().mockImplementation(() => ({
      name: "gemini",
      generateContent: jest.fn().mockResolvedValue({
        text: JSON.stringify({ fullName: "John Doe", fatherName: "James Doe" }),
        tokensUsed: 150,
      }),
      getConfig: jest.fn().mockReturnValue({ model: "gemini-2.5-flash" }),
      isAvailable: jest.fn().mockReturnValue(true),
    })),
  };
});

jest.mock("@/lib/logger/logger", () => ({
  logger: {
    info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn(),
    audit: jest.fn(), security: jest.fn(), ocr: jest.fn(), ai: jest.fn(),
    api: jest.fn(), performance: jest.fn(), validation: jest.fn(),
    repository: jest.fn(), logRequest: jest.fn(),
  },
}));

jest.mock("@/lib/firebase", () => ({}));
jest.mock("@/lib/auth/permissions", () => ({
  PERMISSIONS: {
    students: { view: "students:view", create: "students:create" },
    staff: { view: "staff:view", create: "staff:create" },
    attendance: { view: "attendance:view", mark: "attendance:mark" },
    fees: { view: "fees:view", collect: "fees:collect" },
    exams: { view: "exams:view", create: "exams:create" },
    dashboard: { view: "dashboard:view" },
    settings: { manage: "settings:manage" },
    analytics: { view: "analytics:view" },
  },
}));

// ============================================================
// Test Data
// ============================================================

const mockAdminUser = {
  uid: "admin-uid",
  email: "admin@school.com",
  role: "admin",
  tenantId: "tenant-123",
  onboardingRequired: false,
};

const mockTeacherUser = {
  uid: "teacher-uid",
  email: "teacher@school.com",
  role: "teacher",
  tenantId: "tenant-123",
  onboardingRequired: false,
};

// ============================================================
// Test Suite
// ============================================================

describe("Enterprise E2E Workflows", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================
  // 1. Authentication enforcement (All routes require auth)
  // ============================================================
  describe("Workflow 1: Authentication Enforcement", () => {
    it("blocks unauthenticated OCR upload with 401", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue(null);
      const formData = new FormData();
      formData.append("file", new Blob(["fake"], { type: "image/jpeg" }), "doc.jpg");
      const req = new NextRequest("http://localhost/api/v1/staff/ocr", { method: "POST", body: formData });
      const res = await ocrPOST(req, {} as any);
      expect(res.status).toBe(401);
    });
  });

  // ============================================================
  // 2. AI Agent Pipeline (Teacher Agent → GeminiProvider → Response)
  // ============================================================
  describe("Workflow 7: Teacher AI Agent Pipeline", () => {
    it("executes teacher agent and returns response", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue(mockTeacherUser);
      const req = new NextRequest("http://localhost/api/v1/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType: "teacher", query: "Create a lesson plan" }),
      });
      const res = await agentPOST(req, {} as any);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });

    it("lists available agents", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue(mockTeacherUser);
      const req = new NextRequest("http://localhost/api/v1/ai/agents", { method: "GET" });
      const res = await agentListGET(req, {} as any);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it("returns error for unknown agent type", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue(mockTeacherUser);
      const req = new NextRequest("http://localhost/api/v1/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType: "unknown-agent", query: "test" }),
      });
      const res = await agentPOST(req, {} as any);
      expect(res.status).toBe(400);
    });
  });

  // ============================================================
  // 3. RBAC Permission Validation
  // ============================================================
  describe("Workflow 8: RBAC Permission Enforcement", () => {
    it("blocks unauthenticated requests (401)", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue(null);
      const req = new NextRequest("http://localhost/api/v1/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType: "teacher", query: "test" }),
      });
      const res = await agentPOST(req, {} as any);
      expect(res.status).toBe(401);
    });
  });

  // ============================================================
  // 4. Input Validation
  // ============================================================
  describe("Workflow: Input Validation", () => {
    it("rejects AI agent request without agentType", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue(mockTeacherUser);
      const req = new NextRequest("http://localhost/api/v1/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "test" }),
      });
      const res = await agentPOST(req, {} as any);
      expect(res.status).toBe(400);
    });

    it("rejects AI agent request without query", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue(mockTeacherUser);
      const req = new NextRequest("http://localhost/api/v1/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType: "teacher" }),
      });
      const res = await agentPOST(req, {} as any);
      expect(res.status).toBe(400);
    });
  });
});
