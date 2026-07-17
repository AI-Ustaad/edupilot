// lib/config/env.ts
import { logger } from "@/lib/logger/logger";

// Required environment variables (must be present)
const requiredEnvVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
] as const;

// Optional environment variables (can be missing)
const optionalEnvVars = [
  "NEXT_PUBLIC_ENABLE_OCR",
  "NEXT_PUBLIC_ENABLE_SMS",
  "NEXT_PUBLIC_ENABLE_CHAT",
  "NEXT_PUBLIC_DEMO_MODE",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "GEMINI_API_KEY",
  "QSTASH_TOKEN",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "RESEND_API_KEY",
] as const;

type RequiredEnvVar = typeof requiredEnvVars[number];
type OptionalEnvVar = typeof optionalEnvVars[number];

class EnvConfig {
  private missingVars: string[] = [];

  constructor() {
    this.validate();
  }

  private validate() {
    for (const varName of requiredEnvVars) {
      if (!process.env[varName]) {
        this.missingVars.push(varName);
      }
    }
    if (this.missingVars.length > 0) {
      logger.error(`Missing required environment variables: ${this.missingVars.join(", ")}`);
      if (this.isProduction()) {
        throw new Error(`Missing env vars: ${this.missingVars.join(", ")}`);
      }
    }
  }

  get(key: RequiredEnvVar): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
  }

  getOptional(key: OptionalEnvVar): string | undefined {
    return process.env[key];
  }

  isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  }

  isDevelopment(): boolean {
    return process.env.NODE_ENV === "development";
  }

  getFirebaseConfig() {
    return {
      apiKey: this.get("NEXT_PUBLIC_FIREBASE_API_KEY"),
      authDomain: this.get("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
      projectId: this.get("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
      storageBucket: this.get("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    };
  }

  getFirebaseAdminConfig() {
    return {
      projectId: this.get("FIREBASE_PROJECT_ID"),
      clientEmail: this.get("FIREBASE_CLIENT_EMAIL"),
      privateKey: this.get("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, "\n"),
    };
  }
}

export const env = new EnvConfig();
