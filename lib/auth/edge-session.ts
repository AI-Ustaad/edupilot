// lib/auth/edge-session.ts
//
// Edge-runtime-compatible Firebase session verification.
//
// Next.js middleware runs on the Edge runtime, where `firebase-admin`
// (Node.js-only) cannot be used. This module verifies the `session`
// cookie's JWT signature directly against Google's public keys using
// the `jose` library (WebCrypto-based, Edge-safe).
//
// It accepts both Firebase session cookies:
//   iss: https://session.firebase.google.com/{projectId}
//   keys: https://www.googleapis.com/identitytoolkit/v3/relyingparty/publicKeys
// and Firebase ID tokens:
//   iss: https://securetoken.google.com/{projectId}
//   keys: https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com
// because the server-side `getSessionUser()` accepts both forms.

import {
  createRemoteJWKSet,
  jwtVerify,
  decodeProtectedHeader,
  decodeJwt,
  importX509,
} from "jose";

const GOOGLE_JWKS_URL = new URL(
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
);

// Created once per warm Edge instance; jose honors HTTP caching of the key set.
const ID_TOKEN_JWKS = createRemoteJWKSet(GOOGLE_JWKS_URL);

// Cache for session cookie public certificates and imported CryptoKeys
let sessionCertsCache: {
  certs: Record<string, string>;
  expiresAt: number;
} | null = null;

const sessionCryptoKeyCache = new Map<string, any>();

async function getSessionCookiePublicKey(kid: string): Promise<any | null> {
  const now = Date.now();
  if (sessionCryptoKeyCache.has(kid)) {
    return sessionCryptoKeyCache.get(kid);
  }

  // Check if cached certificates contain the kid and are unexpired
  let certs =
    sessionCertsCache && sessionCertsCache.expiresAt > now
      ? sessionCertsCache.certs
      : null;

  if (!certs || !certs[kid]) {
    try {
      const res = await fetch(
        "https://www.googleapis.com/identitytoolkit/v3/relyingparty/publicKeys",
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) return null;

      // Extract cache-control max-age
      const cacheControl = res.headers.get("cache-control") || "";
      const match = cacheControl.match(/max-age=(\d+)/);
      const maxAgeSeconds = match ? parseInt(match[1], 10) : 3600;

      certs = await res.json();
      sessionCertsCache = {
        certs: certs || {},
        expiresAt: now + maxAgeSeconds * 1000,
      };
    } catch {
      return null;
    }
  }

  const cert = certs?.[kid];
  if (!cert) return null;

  try {
    const key = await importX509(cert, "RS256");
    sessionCryptoKeyCache.set(kid, key);
    return key;
  } catch {
    return null;
  }
}

export interface EdgeSession {
  uid: string;
  email?: string;
}

/**
 * Verifies a Firebase session cookie (or ID token) at the Edge.
 *
 * Returns `{ uid, email }` when the token's signature is valid, the
 * issuer/audience match this Firebase project, and the token is not
 * expired. Returns `null` otherwise.
 *
 * Never throws — every failure mode resolves to `null` (fail closed),
 * so a forged, expired, or malformed cookie can never pass the gate.
 */
export async function verifyEdgeSession(
  token: string | undefined | null
): Promise<EdgeSession | null> {
  try {
    const projectId =
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      process.env.FIREBASE_PROJECT_ID;
    if (!token || !projectId || typeof token !== "string") return null;

    // Decode header to ensure RS256 and extract kid
    const header = decodeProtectedHeader(token);
    if (header.alg !== "RS256" || !header.kid) return null;

    const unverifiedPayload = decodeJwt(token);
    const iss = unverifiedPayload.iss;

    let payload: any;

    if (iss === `https://session.firebase.google.com/${projectId}`) {
      const key = await getSessionCookiePublicKey(header.kid);
      if (!key) return null;

      const result = await jwtVerify(token, key, {
        issuer: `https://session.firebase.google.com/${projectId}`,
        audience: projectId,
        clockTolerance: 30, // seconds of clock-skew tolerance
      });
      payload = result.payload;
    } else if (iss === `https://securetoken.google.com/${projectId}`) {
      const result = await jwtVerify(token, ID_TOKEN_JWKS, {
        issuer: `https://securetoken.google.com/${projectId}`,
        audience: projectId,
        clockTolerance: 30, // seconds of clock-skew tolerance
      });
      payload = result.payload;
    } else {
      // Issuer does not match either session or id token scheme for this project
      return null;
    }

    if (typeof payload.sub !== "string" || payload.sub.length === 0) {
      return null;
    }

    return {
      uid: payload.sub,
      email: typeof payload.email === "string" ? payload.email : undefined,
    };
  } catch {
    return null; // fail closed on any verification error
  }
}
