// lib/auth/permissions.ts

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

const BASE_PERMISSIONS = {
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

  // Legacy compatibility
  books: makeActions("books"),

  bookCenter: makeActions("bookCenter"),

  menu: makeActions("menu"),
  featureFlags: makeActions("featureFlags"),

  // Additional modules
  promotions: makeActions("promotions"),
  certificates: makeActions("certificates"),
  notices: makeActions("notices"),
  notifications: makeActions("notifications"),
  results: makeActions("results"),
  curriculum: makeActions("curriculum"),
  ocr: makeActions("ocr"),
  upload: makeActions("upload"),
  ai: makeActions("ai"),
  payroll: makeActions("payroll"),
  hostel: makeActions("hostel"),
  library: makeActions("library"),
  transport: makeActions("transport"),
  inventory: makeActions("inventory"),
  events: makeActions("events"),
  calendar: makeActions("calendar"),
  documents: makeActions("documents"),
  tenants: makeActions("tenants"),
  schools: makeActions("schools"),
  branding: makeActions("branding"),
  integrations: makeActions("integrations"),
  webhooks: makeActions("webhooks"),
} as const;

export const PERMISSIONS = new Proxy(BASE_PERMISSIONS, {
  get(target, prop: string) {
    if (prop in target) {
      return (target as any)[prop];
    }
    return makeActions(prop);
  },
}) as typeof BASE_PERMISSIONS & Record<string, ReturnType<typeof makeActions>>;

type ValueOf<T> = T[keyof T];
type KnownPermission = ValueOf<{
  [K in keyof typeof BASE_PERMISSIONS]: ValueOf<typeof BASE_PERMISSIONS[K]>;
}>;
export type Permission = KnownPermission | `${string}.${string}`;
