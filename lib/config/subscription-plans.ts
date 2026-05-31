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
    features: [
      // only basic features – adjust to your actual Feature strings
      "aiAssistant",
      "aiExamGenerator",
      "aiTimetable",
      "transport",
      "videoLectures",
      "ledger",
      "behavior",
      "skills",
      "chat",
      "assignments",
      "homework",
      "quizzes",
      "lessonPlans",
      "bookCenter",
      "examCenter",
      "admissions",
      "parents",
      "leaveRequests",
      "advancedAnalytics",
    ].filter(f => ["aiAssistant", "transport", "videoLectures"].includes(f)), // minimal features
  },
  starter: {
    name: "Starter",
    maxStudents: 200,
    maxStaff: 50,
    features: Object.values(ALL_FEATURES).filter(
      f => !["aiAssistant", "aiExamGenerator", "aiTimetable"].includes(f)
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
