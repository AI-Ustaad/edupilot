// __tests__/ai/smart-book-center-b18.test.ts
//
// B18 (26 Nov 2026 audit) — Smart Book Center must be grounded on the real
// Book Center catalogue:
//  - with a book saved in Book Center, Smart Book Center shows it
//    (both when the AI answers and when the AI provider fails);
//  - with an empty catalogue it honestly states no books are available
//    and never presents suggestions as if they were in the library.

import { NextRequest } from "next/server";
import { POST as smartBookCenterRoute } from "@/app/api/v1/ai/smart-book-center/route";
import { getSessionUser } from "@/lib/auth/auth-server";
import { agentRegistry } from "@/lib/ai/agents/AgentRegistry";
import { resetAiRateLimit } from "@/lib/ai/ai-quota-guard";

// Mocks
jest.mock("@/lib/auth/auth-server", () => ({
  getSessionUser: jest.fn(),
}));

jest.mock("@/lib/ai/agents/AgentRegistry", () => ({
  agentRegistry: {
    listAgents: jest.fn().mockReturnValue(["teacher"]),
    execute: jest.fn(),
  },
  AgentNotFoundError: class AgentNotFoundError extends Error {},
}));

const mockSubscriptions: Record<string, any> = {};
const mockAiUsageDocs: any[] = [];
let mockBooksDocs: any[] = [];

const mockDoc = (id: string, collectionName: string) => ({
  get: jest.fn().mockImplementation(async () => {
    if (collectionName === "subscriptions") {
      const data = mockSubscriptions[id];
      return {
        exists: !!data,
        data: () => data || null,
      };
    }
    return { exists: false, data: () => null };
  }),
  set: jest.fn().mockResolvedValue(undefined),
  update: jest.fn().mockResolvedValue(undefined),
});

const mockCollection = (name: string) => ({
  doc: jest.fn().mockImplementation((id: string) => mockDoc(id, name)),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  get: jest.fn().mockImplementation(async () => {
    if (name === "ai_usage") {
      return {
        size: mockAiUsageDocs.length,
        docs: mockAiUsageDocs.map((docData, i) => ({
          id: `usage_${i}`,
          data: () => docData,
        })),
      };
    }
    if (name === "books") {
      return {
        size: mockBooksDocs.length,
        docs: mockBooksDocs.map((docData, i) => ({
          id: `book_${i}`,
          data: () => docData,
        })),
      };
    }
    return { size: 0, docs: [] };
  }),
  add: jest.fn().mockImplementation(async (data: any) => {
    mockAiUsageDocs.push(data);
    return { id: `usage_${mockAiUsageDocs.length}` };
  }),
});

jest.mock("@/lib/firebase-admin", () => ({
  adminDb: {
    collection: (name: string) => mockCollection(name),
  },
  adminAuth: {
    verifySessionCookie: jest.fn(),
    verifyIdToken: jest.fn(),
  },
  dbTimestamp: new Date(),
}));

const LIBRARIAN = {
  uid: "librarian_1",
  email: "librarian@school.edu",
  role: "admin",
  tenantId: "tenant_library",
};

const TEST_BOOK = {
  title: "TEST — Book audit 26 Nov",
  author: "Test Author",
  subject: "Science",
  classGrade: "5",
  tenantId: "tenant_library",
};

async function callSmartBookCenter(query: string) {
  const req = new NextRequest("http://localhost/api/v1/ai/smart-book-center", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
  const res = await smartBookCenterRoute(req);
  const data = await res.json();
  return { res, data };
}

describe("B18: Smart Book Center is grounded on the real Book Center catalogue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetAiRateLimit();
    for (const key of Object.keys(mockSubscriptions)) {
      delete mockSubscriptions[key];
    }
    mockAiUsageDocs.length = 0;
    mockBooksDocs = [];
    (getSessionUser as jest.Mock).mockResolvedValue(LIBRARIAN);
    mockSubscriptions[LIBRARIAN.tenantId] = { planId: "starter", status: "active" };
  });

  it("shows the catalogued book when the AI answers but does not name it", async () => {
    mockBooksDocs = [TEST_BOOK];
    (agentRegistry.execute as jest.Mock).mockResolvedValue(
      "Here are some general science reading suggestions for grade 5."
    );

    const { res, data } = await callSmartBookCenter("recommend science books for class 5");

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.result).toContain("TEST — Book audit 26 Nov");
    expect(data.data.result).not.toContain("no physical or digital books cataloged");
  });

  it("shows the catalogued book when the AI provider fails (fallback must not claim an empty catalogue)", async () => {
    mockBooksDocs = [TEST_BOOK];
    (agentRegistry.execute as jest.Mock).mockRejectedValue(
      new Error("Gemini 503 No capacity")
    );

    const { res, data } = await callSmartBookCenter("recommend science books for class 5");

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.result).toContain("TEST — Book audit 26 Nov");
    expect(data.data.result).toContain("Test Author");
    expect(data.data.result).not.toContain("no physical or digital books cataloged");
  });

  it("honestly states no books are cataloged when the catalogue is empty and the AI fails", async () => {
    mockBooksDocs = [];
    (agentRegistry.execute as jest.Mock).mockRejectedValue(
      new Error("Gemini 503 No capacity")
    );

    const { res, data } = await callSmartBookCenter("recommend science books for class 5");

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.result).toContain("no physical or digital books cataloged");
    expect(data.data.result).toContain("NOT currently in the school library");
  });

  it("states no books are cataloged when the catalogue is empty and the AI answers generically", async () => {
    mockBooksDocs = [];
    (agentRegistry.execute as jest.Mock).mockResolvedValue(
      "Here are some general science reading suggestions for grade 5."
    );

    const { res, data } = await callSmartBookCenter("recommend science books for class 5");

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.result).toContain("no physical or digital books cataloged");
  });
});
