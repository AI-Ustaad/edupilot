// lib/config/featureFlags.ts
import { env } from "./env";

export const featureFlags = {
  // Enable OCR (salary slip extraction)
  enableOCR: env.getOptional("NEXT_PUBLIC_ENABLE_OCR") === "true",

  // Enable SMS notifications
  enableSMS: env.getOptional("NEXT_PUBLIC_ENABLE_SMS") === "true",

  // Enable live chat support
  enableLiveChat: env.getOptional("NEXT_PUBLIC_ENABLE_CHAT") === "true",

  // Demo mode (show demo data instead of real)
  isDemoMode: env.getOptional("NEXT_PUBLIC_DEMO_MODE") === "true",

  // Stripe is enabled if secret key exists
  isStripeEnabled: !!env.getOptional("STRIPE_SECRET_KEY"),
};

// Helper to check if a feature is enabled
export function isFeatureEnabled(feature: keyof typeof featureFlags): boolean {
  return featureFlags[feature];
}
