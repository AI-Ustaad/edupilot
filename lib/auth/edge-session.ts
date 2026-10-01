// lib/auth/edge-session.ts
//
// Edge-runtime-compatible Firebase session verification.
//
// Next.js middleware runs on the Edge runtime, where `firebase-admin`
// (Node.js-only) cannot be used. This module verifies the `session`
// cookie's JWT signature directly against Google's public keys using
// the `jose` library (WebCrypto-based, Edge-safe).
//
// It accepts both Firebase session cookies
//   iss: https://session.firebase.google.com/{projectId}
// and Firebase ID tokens
//   iss: https://securetoken.google.com/{projectId}
// because the server-side `getSessionUser()` accepts both forms.

import { createRemoteJWKSet, jwtVerify } from "jose";

const GOOGLE_JWKS_URL = new URL(
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
);

// Created once per warm Edge instance; jose honors HTTP caching of the key set.
const JWKS = createRemoteJWKSet(GOOGLE_JWKS_URL);

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
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!token || !projectId) return null;

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: [
        `https://securetoken.google.com/${projectId}`,
        `https://session.firebase.google.com/${projectId}`,
      ],
      audience: projectId,
      clockTolerance: 30, // seconds of clock-skew tolerance
    });

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
