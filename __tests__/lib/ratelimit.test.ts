import { checkAuthRateLimit } from "@/lib/ratelimit";

const ipBuckets: Record<string, number> = {};

jest.mock("@upstash/redis", () => ({
  Redis: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("@upstash/ratelimit", () => {
  const MockRatelimit: any = jest.fn().mockImplementation(() => ({
    limit: jest.fn().mockImplementation(async (identifier: string) => {
      ipBuckets[identifier] = (ipBuckets[identifier] || 0) + 1;
      const limit = 5;
      const success = ipBuckets[identifier] <= limit;
      return {
        success,
        limit,
        remaining: Math.max(0, limit - ipBuckets[identifier]),
        reset: Date.now() + 60000,
      };
    }),
  }));

  MockRatelimit.slidingWindow = jest.fn().mockReturnValue({});
  return { Ratelimit: MockRatelimit };
});

describe("Auth Rate Limiting Security", () => {
  beforeEach(() => {
    process.env.UPSTASH_REDIS_REST_URL = "https://mock-redis.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "mock-token";
    for (const key of Object.keys(ipBuckets)) {
      delete ipBuckets[key];
    }
  });

  it("should extract IP from x-forwarded-for header and isolate rate-limit buckets", async () => {
    const req1 = new Request("http://localhost/api/v1/auth/login", {
      headers: { "x-forwarded-for": "203.0.113.1, 198.51.100.1" },
    });
    const req2 = new Request("http://localhost/api/v1/auth/login", {
      headers: { "x-forwarded-for": "198.51.100.2" },
    });

    // Client 1 attempts 5 logins (hits threshold)
    for (let i = 0; i < 5; i++) {
      const result = await checkAuthRateLimit(req1);
      expect(result.success).toBe(true);
    }

    // Client 1 6th attempt is blocked
    const blockedResult = await checkAuthRateLimit(req1);
    expect(blockedResult.success).toBe(false);

    // Client 2 with different IP is NOT blocked (preventing global lockout DoS)
    const client2Result = await checkAuthRateLimit(req2);
    expect(client2Result.success).toBe(true);
  });

  it("should accept direct string IP identifiers", async () => {
    const ip1 = "10.0.0.1";
    const ip2 = "10.0.0.2";

    const res1 = await checkAuthRateLimit(ip1);
    const res2 = await checkAuthRateLimit(ip2);

    expect(res1.success).toBe(true);
    expect(res2.success).toBe(true);
  });

  it("should fall back gracefully to anonymous if no identifier or headers exist without crashing", async () => {
    const result = await checkAuthRateLimit();
    expect(result).toBeDefined();
    expect(typeof result.success).toBe("boolean");
  });
});
