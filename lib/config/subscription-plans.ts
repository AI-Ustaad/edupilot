// lib/config/subscription-plans.ts
import { ALL_FEATURES, Feature } from "@/lib/features/featureFlags";

export interface Plan {
  name: string;
  maxStudents: number;
  maxStaff: number;
  features: Feature[];
}

export const PLANS: Record<string, Plan> = {
  free: {
    name: "Free",
    maxStudents: 50,
    maxStaff: 10,
    // Only essential features – adjust as needed
    features: Object.values(ALL_FEATURES).filter(f =>
      ['videoLectures', 'ledger', 'behavior', 'skills', 'chat', 'assignments', 'homework', 'quizzes', 'lessonPlans', 'bookCenter', 'examCenter', 'admissions', 'parents', 'leaveRequests'].includes(f)
    ) as Feature[],
  },
  starter: {
    name: "Starter",
    maxStudents: 200,
    maxStaff: 50,
    features: Object.values(ALL_FEATURES).filter(
      f => !["aiAssistant", "aiExamGenerator", "aiTimetable", "transport"].includes(f)
    ) as Feature[],
  },
  professional: {
    name: "Professional",
    maxStudents: 1000,
    maxStaff: 200,
    features: Object.values(ALL_FEATURES) as Feature[],
  },
  enterprise: {
    name: "Enterprise",
    maxStudents: 999999,
    maxStaff: 999999,
    features: Object.values(ALL_FEATURES) as Feature[],
  },
};
