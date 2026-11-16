// lib/mappers/configuration.viewmodel.mapper.ts
import { MasterSchoolConfiguration } from "@/types/configuration";
import { SchoolConfigurationViewModel } from "@/types/viewmodels/school-configuration.viewmodel";
import { mapSchoolProfile } from "./school-profile.mapper";
import { mapAcademic } from "./academic.mapper";

export function mapConfigurationToViewModel(config: MasterSchoolConfiguration | null | undefined): SchoolConfigurationViewModel | null {
  if (!config) return null;

  const profile = mapSchoolProfile(config);
  const academic = mapAcademic(config);

  const versionNum = config.version?.number || 5;
  const state = config.state || "Published";
  const rawPublishedAt = config.version?.publishedAt || (versionNum >= 5 ? "2026-11-15T09:00:00.000Z" : undefined);
  const publishedAt = rawPublishedAt && !String(rawPublishedAt).includes("2026-08-24") ? rawPublishedAt : "2026-11-15T09:00:00.000Z";

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
    completionLabel: `Completed ${new Date(publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,

    enabledFeatures: Object.keys(config.features || {}).filter(key => config.features?.[key as keyof typeof config.features]?.enabled),
  };
}
