// types/curriculum/academic.ts

export interface AcademicLevel {
  id: string; // e.g., "primary", "secondary", "igcse"
  name: string; // e.g., "Primary", "Secondary", "IGCSE"
  grades: Grade[];
}

export interface Grade {
  id: string; // e.g., "grade_1", "year_10"
  name: string; // e.g., "Grade 1", "Year 10"
  order: number; // For sorting
  ageRule?: string; // e.g., "5-6 years"
  subjectGroups: SubjectGroup[]; // Subjects available for this grade
}

export interface SubjectGroup {
  type: "Core" | "Elective" | "Optional" | "Vocational" | "Language" | "Religious";
  subjects: Subject[];
}

export interface Subject {
  id: string; // e.g., "eng_101", "phy_201"
  name: string; // e.g., "English", "Physics"
  code?: string; // e.g., "ENG", "PHY"
  requiresLab?: boolean; // For Science/Computer subjects
  defaultPeriods?: number; // e.g., 4 periods per week
}

export interface AssessmentRule {
  type: "MCQs" | "Short Questions" | "Long Questions" | "Practical" | "Paper 1" | "Paper 2";
  weightage: number; // e.g., 20% for MCQs
}

export interface PromotionRule {
  minPassingPercentage: number; // e.g., 33% or 40%
  failInSubjectsAllowed: number; // e.g., 0 (fail in any subject means no promotion)
}
