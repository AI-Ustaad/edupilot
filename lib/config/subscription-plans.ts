// lib/config/subscription-plans.ts
import { ALL_FEATURES, Feature } from "@/lib/features/featureFlags";

export type PlanTier = "free" | "starter" | "professional" | "enterprise";

export interface PlanLimits {
  students: number;
  staff: number;
}

export interface Plan {
  id: PlanTier | string;
  name: string;
  price: number;
  currency: string;
  priceId?: string;
  stripePriceId?: string;
  maxStudents: number;
  maxStaff: number;
  limits: PlanLimits;
  features: Feature[];
}

export const PLANS: Record<string, Plan> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    currency: "PKR",
    maxStudents: 50,
    maxStaff: 10,
    limits: { students: 50, staff: 10 },
    features: Object.values(ALL_FEATURES).filter(f =>
      ['videoLectures', 'ledger', 'behavior', 'skills', 'chat', 'assignments', 'homework', 'quizzes', 'lessonPlans', 'bookCenter', 'examCenter', 'admissions', 'parents', 'leaveRequests'].includes(f)
    ) as Feature[],
  },
  starter: {
    id: "starter",
    name: "Starter",
    price: 2000,
    currency: "PKR",
    priceId: process.env.STRIPE_STARTER_PRICE_ID || "price_starter_placeholder",
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || "price_starter_placeholder",
    maxStudents: 200,
    maxStaff: 50,
    limits: { students: 200, staff: 50 },
    features: Object.values(ALL_FEATURES).filter(
      f => !["aiAssistant", "aiExamGenerator", "aiTimetable", "transport"].includes(f)
    ) as Feature[],
  },
  professional: {
    id: "professional",
    name: "Professional",
    price: 3000,
    currency: "PKR",
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || "price_professional_placeholder",
    stripePriceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || "price_professional_placeholder",
    maxStudents: 1000,
    maxStaff: 200,
    limits: { students: 1000, staff: 200 },
    features: Object.values(ALL_FEATURES) as Feature[],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 5000,
    currency: "PKR",
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || "price_enterprise_placeholder",
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || "price_enterprise_placeholder",
    maxStudents: 999999,
    maxStaff: 999999,
    limits: { students: 999999, staff: 999999 },
    features: Object.values(ALL_FEATURES) as Feature[],
  },
};

export const SUBSCRIPTION_PLANS = PLANS;

export function getStripePriceId(planId: string): string | undefined {
  return PLANS[planId]?.priceId || PLANS[planId]?.stripePriceId;
}

export function getPlanByPriceId(priceId: string): Plan | undefined {
  return Object.values(PLANS).find(
    p => p.priceId === priceId || p.stripePriceId === priceId
  );
}
