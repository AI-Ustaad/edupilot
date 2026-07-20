// types/viewmodels/school-configuration.viewmodel.ts
import { BaseViewModel } from "./base.viewmodel";
import { ConfigurationState } from "@/types/configuration/core";

export interface SchoolConfigurationViewModel extends BaseViewModel {
  state: ConfigurationState;
  stateLabel: string; // e.g., "Published", "Draft"
  
  // School Profile
  schoolName: string;
  schoolType: string;
  boardName: string;
  
  // Academic Structure
  levels: string[];
  classes: { id: string; name: string }[]; // For UI dropdowns
  classCount: number;
  classSummary: string; // e.g., "24 Classes"
  subjectCount: number;
  sectionCount: number;
  sectionNames: string[]; // For UI dropdowns
  
  // 🚀 NEW: Intelligence Engine Outputs
  requiredLabs: string[];
  requiredTeachers: Record<string, number>;
  
  // Version Info
  versionNumber: number;
  versionLabel: string; // e.g., "Version 4"
  publishedAt?: string;
  completionLabel: string; // e.g., "Completed 15 July 2026"
  
  // Features
  enabledFeatures: string[];
}
