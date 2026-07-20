// types/viewmodels/school-configuration.viewmodel.ts
import { BaseViewModel } from "./base.viewmodel";
import { ConfigurationState } from "@/types/configuration/core";

export interface SchoolConfigurationViewModel extends BaseViewModel {
  state: ConfigurationState;
  stateLabel: string;
  
  // School Profile
  schoolName: string;
  schoolType: string;
  boardName: string;
  
  // Academic Structure
  levels: string[];
  classes: { id: string; name: string }[]; // 🚀 NEW: Added for dropdowns
  classCount: number;
  classSummary: string;
  subjectCount: number;
  sectionCount: number;
  sectionNames: string[]; // 🚀 NEW: Explicitly added for dropdowns
  
  // Version Info
  versionNumber: number;
  versionLabel: string;
  publishedAt?: string;
  completionLabel: string;
  
  // Features
  enabledFeatures: string[];
}
