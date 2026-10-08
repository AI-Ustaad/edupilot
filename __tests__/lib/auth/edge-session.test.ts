import { verifyEdgeSession } from "@/lib/auth/edge-session";
import { SignJWT, generateKeyPair, importPKCS8 } from "jose";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

describe("verifyEdgeSession - Edge Runtime Firebase Session Verification", () => {
  const originalEnv = process.env;
  const PROJECT_ID = "edupilot-d262f";

  // Exact matching RSA keypair and certificate
  let privateKey: any;
  let testKid = "test-kid-deterministic-12345";
  let testCert: string;

  beforeAll(async () => {
    // Generate one deterministic RSA keypair and matching self-signed X.509 cert
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "test-rsa-"));
    const keyPath = path.join(tmpDir, "key.pem");
    const certPath = path.join(tmpDir, "cert.pem");
    execSync(
      `openssl req -x509 -newkey rsa:2048 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/CN=test" 2>/dev/null`
    );
    const keyPem = fs.readFileSync(keyPath, "utf8");
    testCert = fs.readFileSync(certPath, "utf8");
    fs.unlinkSync(keyPath);
    fs.unlinkSync(certPath);
    fs.rmdirSync(tmpDir);

    privateKey = await importPKCS8(keyPem, "RS256");
  });

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, NEXT_PUBLIC_FIREBASE_PROJECT_ID: PROJECT_ID };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns null when token is null, undefined, or empty", async () => {
    expect(await verifyEdgeSession(null)).toBeNull();
    expect(await verifyEdgeSession(undefined)).toBeNull();
    expect(await verifyEdgeSession("")).toBeNull();
    expect(await verifyEdgeSession("   ")).toBeNull();
  });

  it("returns null when NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing", async () => {
    delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    delete process.env.FIREBASE_PROJECT_ID;

    expect(await verifyEdgeSession("some.jwt.token")).toBeNull();
  });

  it("returns null for malformed tokens", async () => {
    expect(await verifyEdgeSession("invalid-token-format")).toBeNull();
    expect(await verifyEdgeSession("header.payload")).toBeNull();
  });

  it("returns null for tokens signed with non-RS256 algorithm or missing kid", async () => {
    const kp = await generateKeyPair("RS256");
    // Token without kid in header
    const tokenWithoutKid = await new SignJWT({ sub: "user_123" })
      .setProtectedHeader({ alg: "RS256" })
      .setIssuer(`https://session.firebase.google.com/${PROJECT_ID}`)
      .setAudience(PROJECT_ID)
      .setExpirationTime("2h")
      .sign(kp.privateKey);

    expect(await verifyEdgeSession(tokenWithoutKid)).toBeNull();
  });

  it("returns null when token issuer does not match project ID", async () => {
    const tokenWrongIssuer = await new SignJWT({ sub: "user_123" })
      .setProtectedHeader({ alg: "RS256", kid: testKid })
      .setIssuer("https://malicious.issuer.com/edupilot")
      .setAudience(PROJECT_ID)
      .setExpirationTime("2h")
      .sign(privateKey);

    expect(await verifyEdgeSession(tokenWrongIssuer)).toBeNull();
  });

  it("returns null when token audience does not match project ID", async () => {
    const tokenWrongAud = await new SignJWT({ sub: "user_123" })
      .setProtectedHeader({ alg: "RS256", kid: testKid })
      .setIssuer(`https://session.firebase.google.com/${PROJECT_ID}`)
      .setAudience("wrong-project-id")
      .setExpirationTime("2h")
      .sign(privateKey);

    expect(await verifyEdgeSession(tokenWrongAud)).toBeNull();
  });

  it("returns null when token is expired", async () => {
    const expiredToken = await new SignJWT({ sub: "user_123" })
      .setProtectedHeader({ alg: "RS256", kid: testKid })
      .setIssuer(`https://session.firebase.google.com/${PROJECT_ID}`)
      .setAudience(PROJECT_ID)
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .sign(privateKey);

    expect(await verifyEdgeSession(expiredToken)).toBeNull();
  });

  it("verifies a valid Firebase Session Cookie when public key is resolved", async () => {
    const validSessionToken = await new SignJWT({
      sub: "user_valid_123",
      email: "teacher@school.com",
    })
      .setProtectedHeader({ alg: "RS256", kid: testKid })
      .setIssuer(`https://session.firebase.google.com/${PROJECT_ID}`)
      .setAudience(PROJECT_ID)
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(privateKey);

    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockImplementation(async (url: string) => {
      if (url.includes("identitytoolkit/v3/relyingparty/publicKeys")) {
        return {
          ok: true,
          headers: new Headers({ "cache-control": "public, max-age=3600" }),
          json: async () => ({ [testKid]: testCert }),
        };
      }
      return originalFetch(url as any);
    }) as any;

    try {
      const session = await verifyEdgeSession(validSessionToken);
      expect(session).not.toBeNull();
      expect(session?.uid).toBe("user_valid_123");
      expect(session?.email).toBe("teacher@school.com");
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("returns null when session token signature is forged or mismatched", async () => {
    // Different keypair to test signature verification failure
    const forgedKp = await generateKeyPair("RS256");
    const forgedToken = await new SignJWT({
      sub: "attacker_123",
      email: "attacker@malicious.com",
    })
      .setProtectedHeader({ alg: "RS256", kid: testKid })
      .setIssuer(`https://session.firebase.google.com/${PROJECT_ID}`)
      .setAudience(PROJECT_ID)
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(forgedKp.privateKey);

    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockImplementation(async (url: string) => {
      if (url.includes("identitytoolkit/v3/relyingparty/publicKeys")) {
        return {
          ok: true,
          headers: new Headers({ "cache-control": "public, max-age=3600" }),
          json: async () => ({ [testKid]: testCert }),
        };
      }
      return originalFetch(url as any);
    }) as any;

    try {
      const session = await verifyEdgeSession(forgedToken);
      expect(session).toBeNull();
    } finally {
      global.fetch = originalFetch;
    }
  });
});
