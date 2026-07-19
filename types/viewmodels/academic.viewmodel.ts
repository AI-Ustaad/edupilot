// types/viewmodels/academic.viewmodel.ts
export interface AcademicViewModel {
  levels: string[];
  classes: { name: string; subjects: string[] }[];
  sectionNames: string[];
  subjects: string[];
}
