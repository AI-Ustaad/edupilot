export const TENANT_FEATURES = {
  students: "students",
  attendance: "attendance",
  fees: "fees",
  staff: "staff",
  timetable: "timetable",

  aiAssistant: "aiAssistant",
  aiExam: "aiExam",
  aiTimetable: "aiTimetable",

  transport: "transport",
  analytics: "analytics",
  billing: "billing",

  parents: "parents",
  homework: "homework",
  quizzes: "quizzes",
  lessonPlans: "lessonPlans",

  whiteLabel: "whiteLabel",
} as const;

export type TenantFeature =
  (typeof TENANT_FEATURES)[keyof typeof TENANT_FEATURES];
