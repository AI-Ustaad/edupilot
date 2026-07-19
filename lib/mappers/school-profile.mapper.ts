// lib/mappers/school-profile.mapper.ts
import { MasterSchoolConfiguration } from "@/types/configuration";

export function mapSchoolProfile(config: MasterSchoolConfiguration) {
  return {
    schoolName: config.school?.name || "N/A",
    schoolType: config.school?.type || "N/A",
    boardName: config.school?.boardName || "N/A",
  };
}
