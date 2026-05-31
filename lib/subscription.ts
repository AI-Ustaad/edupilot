// lib/subscription.ts

import { adminDb } from "@/lib/firebase-admin";

export type SubscriptionStatus =
  | "trial"
  | "active"
  | "past_due"
  | "cancelled"
  | "expired";

export interface SubscriptionResult {
  valid: boolean;
  status?: SubscriptionStatus;
  message?: string;
  expiresAt?: Date | null;
}

export async function isSubscriptionValid(
  tenantId: string
): Promise<SubscriptionResult> {
  try {
    if (!tenantId) {
      return {
        valid: false,
        message: "Tenant ID missing",
      };
    }

    const tenantDoc = await adminDb
      .collection("tenants")
      .doc(tenantId)
      .get();

    if (!tenantDoc.exists) {
      return {
        valid: false,
        message: "Tenant not found",
      };
    }

    const tenant = tenantDoc.data();

    const status = (tenant?.subscriptionStatus ||
      "trial") as SubscriptionStatus;

    const expiresAt = tenant?.subscriptionEndsAt
      ? tenant.subscriptionEndsAt.toDate?.() ||
        new Date(tenant.subscriptionEndsAt)
      : null;

    switch (status) {
      case "active":
        return {
          valid: true,
          status,
          expiresAt,
        };

      case "trial":
        if (!expiresAt) {
          return {
            valid: true,
            status,
          };
        }

        if (expiresAt > new Date()) {
          return {
            valid: true,
            status,
            expiresAt,
          };
        }

        return {
          valid: false,
          status,
          message: "Trial expired",
          expiresAt,
        };

      case "past_due":
        return {
          valid: false,
          status,
          message: "Payment overdue",
          expiresAt,
        };

      case "cancelled":
        return {
          valid: false,
          status,
          message: "Subscription cancelled",
          expiresAt,
        };

      case "expired":
        return {
          valid: false,
          status,
          message: "Subscription expired",
          expiresAt,
        };

      default:
        return {
          valid: false,
          message: "Invalid subscription state",
        };
    }
  } catch (error) {
    console.error("Subscription validation failed:", error);

    return {
      valid: false,
      message: "Subscription verification failed",
    };
  }
}

export async function getSubscription(
  tenantId: string
) {
  const tenantDoc = await adminDb
    .collection("tenants")
    .doc(tenantId)
    .get();

  if (!tenantDoc.exists) {
    return null;
  }

  return tenantDoc.data();
}
