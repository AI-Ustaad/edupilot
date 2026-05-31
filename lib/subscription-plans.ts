// lib/config/subscription-plans.ts
import { ALL_FEATURES, Feature } from "@/lib/features/featureFlags";

export interface Plan {
  name: string;
  maxStudents: number;
  maxStaff: number;
  features: Feature[];   // allowed features for this plan
}

export const PLANS: Record<string, Plan> = {
  free: {
    name: "Free",
    maxStudents: 50,
    maxStaff: 10,
    features: [
      "students.view", "staff.view", "attendance.view", "attendance.create",
      "fees.view", "fees.create",
      "dashboard.view",
      "settings.view",
      "billing.view",
      "audit.view",
      // no AI, no transport, no video library
    ],
  },
  starter: {
    name: "Starter",
    maxStudents: 200,
    maxStaff: 50,
    features: [
      ...ALL_FEATURES,   // all features except advanced ones
    ].filter(f => !["aiAssistant", "aiExamGenerator", "aiTimetable", "transport"].includes(f)),
  },
  professional: {
    name: "Professional",
    maxStudents: 1000,
    maxStaff: 200,
    features: [
      ...ALL_FEATURES,   // all features including AI
    ],
  },
  enterprise: {
    name: "Enterprise",
    maxStudents: 999999,
    maxStaff: 999999,
    features: [
      ...ALL_FEATURES,   // everything + custom features
    ],
  },
};
