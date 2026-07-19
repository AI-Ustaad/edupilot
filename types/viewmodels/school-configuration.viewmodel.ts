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
  classCount: number;
  classSummary: string; // e.g., "24 Classes"
  subjectCount: number;
  sectionCount: number;
  sectionNames: string[]; // 🚀 FIX: Added for ConfigurationEditor to pre-fill form
  
  // Version Info
  versionNumber: number;
  versionLabel: string; // e.g., "Version 4"
  publishedAt?: string;
  completionLabel: string; // e.g., "Completed 15 July 2026"
  
  // Features
  enabledFeatures: string[];
}
