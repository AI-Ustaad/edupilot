// lib/mappers/configuration.viewmodel.mapper.ts
import { MasterSchoolConfiguration } from "@/types/configuration";
import { SchoolConfigurationViewModel } from "@/types/viewmodels/school-configuration.viewmodel";
import { mapSchoolProfile } from "./school-profile.mapper";
import { mapAcademic } from "./academic.mapper";

export function mapConfigurationToViewModel(config: MasterSchoolConfiguration | null | undefined): SchoolConfigurationViewModel | null {
  if (!config) return null;

  const profile = mapSchoolProfile(config);
  const academic = mapAcademic(config);
  
  const versionNum = config.version?.number || 1;
  const state = config.state || "Draft";
  const publishedAt = config.version?.publishedAt;
  
  return {
    id: config.id || "current_config",
    isLoading: false,
    hasErrors: false,
    
    state: state,
    stateLabel: state.charAt(0).toUpperCase() + state.slice(1),
    
    ...profile,
    
    ...academic,
    
    versionNumber: versionNum,
    versionLabel: `Version ${versionNum}`,
    publishedAt: publishedAt,
    completionLabel: publishedAt 
      ? `Completed ${new Date(publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` 
      : "Migrated configuration",
      
    enabledFeatures: Object.keys(config.features || {}).filter(key => config.features?.[key as keyof typeof config.features]?.enabled),
  };
}
