export interface IEducationRulesService {
  getCountries(): Promise<any[]>;
  getProvinces(countryId: string): Promise<any[]>;
  getAuthorities(countryId: string, ownershipType?: string, institutionType?: string): Promise<any[]>;
  getSystems(authorityId: string): Promise<any[]>;
  getVersions(systemId: string): Promise<any[]>;
  getLevels(versionId: string): Promise<any[]>;
  generateAcademicStructure(versionId: string, selectedLevelIds: string[]): Promise<any>;
}
