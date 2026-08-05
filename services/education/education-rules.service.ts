import { educationRulesEngine } from "@/education/engines/education-rules.engine";
import type { IEducationRulesService } from "@/interfaces/IEducationRulesService";

export class EducationRulesService implements IEducationRulesService {
  async getCountries(): Promise<any[]> {
    return educationRulesEngine.getCountries();
  }

  async getProvinces(countryId: string): Promise<any[]> {
    return educationRulesEngine.getProvinces(countryId);
  }

  async getAuthorities(countryId: string, ownershipType?: string, institutionType?: string): Promise<any[]> {
    return educationRulesEngine.getAuthorities(countryId, ownershipType, institutionType);
  }

  async getSystems(authorityId: string): Promise<any[]> {
    return educationRulesEngine.getSystems(authorityId);
  }

  async getVersions(systemId: string): Promise<any[]> {
    return educationRulesEngine.getVersions(systemId);
  }

  async getLevels(versionId: string): Promise<any[]> {
    return educationRulesEngine.getLevels(versionId);
  }

  async generateAcademicStructure(versionId: string, selectedLevelIds: string[]): Promise<any> {
    return educationRulesEngine.generateAcademicStructure(versionId, selectedLevelIds);
  }
}

export const educationRulesService = new EducationRulesService();
