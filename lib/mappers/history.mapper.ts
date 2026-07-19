// lib/mappers/history.mapper.ts
import { MasterSchoolConfiguration } from "@/types/configuration";

export function mapHistory(historyDocs: MasterSchoolConfiguration[] = []) {
  return historyDocs.map((item, index) => {
    const versionNum = item.version?.number || index + 1;
    const createdAt = item.version?.createdAt || new Date().toISOString();
    
    return {
      id: item.id || `hist_${index}`,
      isLoading: false,
      hasErrors: false,
      versionNumber: versionNum,
      versionLabel: `Version ${versionNum}`,
      reason: item.version?.reason || "Configuration Updated",
      createdBy: item.version?.createdBy || "System",
      createdAt: createdAt,
      formattedDate: new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    };
  });
}
