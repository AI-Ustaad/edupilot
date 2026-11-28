import { getClientIp } from "@/lib/http/client-ip";

function req(headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/v1/auth/session", { headers });
}

describe("getClientIp (B20)", () => {
  it("returns the first entry of x-forwarded-for (real client behind Vercel)", () => {
    expect(
      getClientIp(req({ "x-forwarded-for": "203.0.113.45, 198.51.100.1, 192.0.2.1" }))
    ).toBe("203.0.113.45");
  });

  it("returns a single x-forwarded-for value", () => {
    expect(getClientIp(req({ "x-forwarded-for": "182.123.45.67" }))).toBe("182.123.45.67");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    expect(getClientIp(req({ "x-real-ip": "198.51.100.9" }))).toBe("198.51.100.9");
  });

  it("accepts a valid IPv6 client address", () => {
    expect(
      getClientIp(req({ "x-forwarded-for": "2001:db8::1, 198.51.100.1" }))
    ).toBe("2001:db8::1");
  });

  it("ignores a malformed first entry and falls back to x-real-ip", () => {
    expect(
      getClientIp(
        req({ "x-forwarded-for": "not-an-ip", "x-real-ip": "203.0.113.7" })
      )
    ).toBe("203.0.113.7");
  });

  it("never returns a loopback or garbage value — yields unknown without headers", () => {
    expect(getClientIp(req())).toBe("unknown");
    expect(getClientIp(req({ "x-forwarded-for": "garbage" }))).toBe("unknown");
    // The old hardcoded defect value must never be produced.
    expect(getClientIp(req())).not.toBe("127.0.0.1");
  });
});
