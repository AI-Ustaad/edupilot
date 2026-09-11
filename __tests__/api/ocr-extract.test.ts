const mockCreateWorker = jest.fn();

jest.mock("tesseract.js", () => ({ createWorker: mockCreateWorker }));

import { POST } from "@/app/api/v1/ocr/extract/route";
import { getSessionUser } from "@/lib/auth/auth-server";

jest.mock("@/lib/auth/auth-server");
jest.mock("@/lib/firebase-admin", () => ({
  adminDb: {
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ tenantId: "tenant123" }) }),
      }),
      add: jest.fn().mockResolvedValue({ id: "doc123" }),
    }),
  },
}));

jest.mock("@/lib/logger/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("OCR Extract API - Regression Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: "user123",
      tenantId: "tenant123",
      role: "admin",
    });
  });

  describe("P0-01: PDF OCR must not return fabricated PII", () => {
    const fabricatedValues = [
      "ahmed raza",
      "muhammad raza",
      "12345-1234567-1",
      "03001234567",
      "emp001",
      "teacher",
      "ubl",
      "123456789",
      "2020-01-01",
    ];

    const createPdfRequest = (image: string) =>
      new Request("http://localhost/api/v1/ocr/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, documentType: "salary_slip" }),
      });

    it.each([
      ["PDF magic bytes", Buffer.from("%PDF-1.4").toString("base64")],
      ["PDF-like base64", Buffer.from("%PDF-1.4 fake pdf content").toString("base64")],
      ["malformed PDF", Buffer.from("%PDF-not-a-valid-pdf").toString("base64")],
    ])("returns 422 for %s input", async (_label, image) => {
      const res = await POST(createPdfRequest(image) as any, {} as any);

      expect(res.status).toBe(422);
    });

    it("does not contain any confirmed fabricated PII in the error response", async () => {
      const image = Buffer.from("%PDF-1.4 fake pdf content").toString("base64");
      const res = await POST(createPdfRequest(image) as any, {} as any);
      const json = await res.json();
      const responseStr = JSON.stringify(json).toLowerCase();

      fabricatedValues.forEach((value) => {
        expect(responseStr).not.toContain(value);
      });
      expect(responseStr).not.toContain('"bps":"16"');
      expect(json.data).toBe(null);
    });

    it("reports unsupported PDF failure using the standard error response contract", async () => {
      const image = Buffer.from("%PDF-1.4").toString("base64");
      const res = await POST(createPdfRequest(image) as any, {} as any);
      const json = await res.json();

      expect(res.status).toBe(422);
      expect(json).toEqual({
        success: false,
        message: "PDF OCR extraction is not supported",
        data: null,
        errors: null,
        meta: null,
        traceId: expect.any(String),
        timestamp: expect.any(String),
      });
    });

    it("processes a supported non-PDF image through the genuine Tesseract path", async () => {
      const recognize = jest.fn().mockResolvedValue({
        data: { text: "Name: Test Employee" },
      });
      const terminate = jest.fn().mockResolvedValue(undefined);
      mockCreateWorker.mockResolvedValue({ recognize, terminate });

      const image = Buffer.from("supported image bytes").toString("base64");
      const res = await POST(createPdfRequest(image) as any, {} as any);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.fullName).toBe("Test Employee");
      expect(mockCreateWorker).toHaveBeenCalledWith("eng");
      expect(recognize).toHaveBeenCalledWith(Buffer.from("supported image bytes"));
      expect(terminate).toHaveBeenCalledTimes(1);
    });
  });

  describe("Auth requirement", () => {
    it("returns 401 when not authenticated", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue(null);

      const req = new Request("http://localhost/api/v1/ocr/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: Buffer.from("fake image").toString("base64"),
          documentType: "salary_slip",
        }),
      });

      const res = await POST(req as any, {} as any);
      expect(res.status).toBe(401);
    });
  });
});
