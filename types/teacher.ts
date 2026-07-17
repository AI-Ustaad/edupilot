// types/teacher.ts
// Teacher module domain types: Assignments, Lesson Plans, Books, Behavior

// ─── Assignment ──────────────────────────────────────────────
export interface Assignment {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  classGrade: string;
  section: string;
  subject: string;
  dueDate?: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface AssignmentSubmission {
  id: string;
  tenantId: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  fileUrl: string;
  fileName: string;
  submittedBy: string;
  createdAt: Date;
}

// ─── Lesson Plan ─────────────────────────────────────────────
export interface LessonPlan {
  id: string;
  tenantId: string;
  date: string;
  topic: string;
  objective: string;
  materials?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

// ─── Book ────────────────────────────────────────────────────
export interface Book {
  id: string;
  tenantId: string;
  title: string;
  author?: string;
  subject?: string;
  classGrade?: string;
  isbn?: string;
  publisher?: string;
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// ─── Behavior Log ────────────────────────────────────────────
export interface BehaviorLog {
  id: string;
  tenantId: string;
  studentId: string;
  points: number;
  reason: string;
  recordedBy: string;
  createdAt: Date;
}
