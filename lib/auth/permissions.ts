// lib/auth/permissions.ts
// FIXED: ہر module میں مکمل action set (view, create, update, delete, manage)
// شامل کیا گیا ہے تاکہ کوئی بھی page کسی بھی action کو استعمال کر سکے
// بغیر "Property does not exist" error کے۔

function makeActions<T extends string>(module: T) {
  return {
    view: `${module}.view`,
    create: `${module}.create`,
    update: `${module}.update`,
    delete: `${module}.delete`,
    manage: `${module}.manage`,
    approve: `${module}.approve`,
    collect: `${module}.collect`,
    mark: `${module}.mark`,
    grade: `${module}.grade`,
    send: `${module}.send`,
    export: `${module}.export`,
    generate: `${module}.generate`,
  } as const;
}

export const PERMISSIONS = {
  dashboard: makeActions("dashboard"),
  students: makeActions("students"),
  staff: makeActions("staff"),
  fees: makeActions("fees"),
  attendance: makeActions("attendance"),
  parents: makeActions("parents"),
  settings: makeActions("settings"),
  billing: makeActions("billing"),
  audit: makeActions("audit"),
  analytics: makeActions("analytics"),
  subscriptions: makeActions("subscriptions"),
  assignments: makeActions("assignments"),
  homework: makeActions("homework"),
  quizzes: makeActions("quizzes"),
  lessonPlans: makeActions("lessonPlans"),
  marks: makeActions("marks"),
  buses: makeActions("buses"),
  chat: makeActions("chat"),
  ledger: makeActions("ledger"),
  videoLectures: makeActions("videoLectures"),
  exams: makeActions("exams"),
  syllabus: makeActions("syllabus"),
  admissions: makeActions("admissions"),
  whitelabel: makeActions("whitelabel"),
  users: makeActions("users"),
  gdpr: makeActions("gdpr"),
  reports: makeActions("reports"),
  academicYear: makeActions("academicYear"),
  classes: makeActions("classes"),
  timetable: makeActions("timetable"),
  leaves: makeActions("leaves"),
  behavior: makeActions("behavior"),
  skills: makeActions("skills"),
  bookCenter: makeActions("bookCenter"),
  menu: makeActions("menu"),
  featureFlags: makeActions("featureFlags"),
} as const;

// Recursive type — ہر module کی ہر action ایک ہی Permission union میں شامل ہوتی ہے
type ValueOf<T> = T[keyof T];
export type Permission = ValueOf<{
  [K in keyof typeof PERMISSIONS]: ValueOf<typeof PERMISSIONS[K]>;
}>;
