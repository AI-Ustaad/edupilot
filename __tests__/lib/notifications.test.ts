import { sendSMS, sendEmail, getTwilioClient } from "@/lib/notifications";
import { logger } from "@/lib/logger/logger";

jest.mock("@/lib/logger/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("twilio", () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({ sid: "SM123" }),
    },
  }));
});

jest.mock("@sendgrid/mail", () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([{ statusCode: 202 }]),
}));

describe("lib/notifications", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("getTwilioClient returns null when environment variables are missing", () => {
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    expect(getTwilioClient()).toBeNull();
  });

  it("sendSMS warns and skips execution when credentials are not configured", async () => {
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_PHONE_NUMBER;

    await sendSMS("+1234567890", "Test message");
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("Twilio credentials or phone number missing")
    );
  });

  it("sendEmail warns and skips execution when SENDGRID_API_KEY is missing", async () => {
    delete process.env.SENDGRID_API_KEY;

    await sendEmail("test@example.com", "Subject", "<p>Body</p>");
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("SendGrid API key not configured")
    );
  });
});

