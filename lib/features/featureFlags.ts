export const ALL_FEATURES = {
  aiAssistant: 'aiAssistant',
  aiExamGenerator: 'aiExamGenerator',
  aiTimetable: 'aiTimetable',
  transport: 'transport',       // buses
  videoLectures: 'videoLectures',
  ledger: 'ledger',
  behavior: 'behavior',
  skills: 'skills',
  chat: 'chat',
  assignments: 'assignments',
  homework: 'homework',
  quizzes: 'quizzes',
  lessonPlans: 'lessonPlans',
  bookCenter: 'bookCenter',
  examCenter: 'examCenter',
  admissions: 'admissions',
  parents: 'parents',
  leaveRequests: 'leaveRequests',
  advancedAnalytics: 'advancedAnalytics',
} as const;

export type Feature = typeof ALL_FEATURES[keyof typeof ALL_FEATURES];
