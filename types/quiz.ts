// types/quiz.ts
export interface Quiz {
  id: string;
  tenantId: string;
  title: string;
  classGrade: string;
  section: string;
  subject: string;
  dueDate?: string | null;
  questions: QuizQuestion[];
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: string;
}

export interface QuizSubmission {
  id: string;
  tenantId: string;
  quizId: string;
  studentId: string;
  studentName: string;
  answers: GradedAnswer[];
  correct: number;
  total: number;
  percentage: number;
  submittedBy: string;
  createdAt: Date;
}

export interface GradedAnswer {
  selected: string;
  correct: boolean;
}
