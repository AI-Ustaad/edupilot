// lib/http/client-ip.ts
// B20 — the real client IP behind the Vercel proxy.
//
// Vercel terminates TLS at its edge and forwards the request to the
// serverless function, so the socket address is always a Vercel/proxy
// address. The real client IP arrives in the forwarding headers:
// `x-forwarded-for` lists the client first, then each proxy in the chain.
// `x-real-ip` is the fallback set by some proxies. The same header order
// is already used by lib/ratelimit.ts for login rate limiting.

const IPV4_RE =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const IPV6_RE = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;

function isValidIp(value: string): boolean {
  return IPV4_RE.test(value) || IPV6_RE.test(value);
}

/**
 * Returns the real client IP for a request received behind a proxy
 * (Vercel). Prefers the first entry of `x-forwarded-for`, falls back to
 * `x-real-ip`. Never echoes an unvalidated header value: a missing,
 * empty, or malformed value yields "unknown" instead of a loopback or
 * garbage string.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first && isValidIp(first)) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp && isValidIp(realIp)) return realIp;
  return "unknown";
}
