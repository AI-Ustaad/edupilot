// types/configuration/index.ts

// 🚀 FIX: Re-export all types so other files (like mapper) can import them
export * from './core';
export * from './features';
export * from './domains';

import { ConfigurationState, ConfigurationVersion, ConfigurationMetadata } from "./core";
import { FeatureRegistry } from "./features";
import { SchoolProfile, AcademicStructure } from "./domains";

// THE SINGLE SOURCE OF TRUTH FOR EDUPILOT
export interface MasterSchoolConfiguration {
  id: string; 
  tenantId: string;
  state: ConfigurationState;
  
  // Core
  metadata: ConfigurationMetadata;
  version: ConfigurationVersion;
  
  // Domains
  school: SchoolProfile;
  academic: AcademicStructure;
  features: FeatureRegistry;
  
  // Note: Add Fees, Attendance, Grading here as we build them
}
