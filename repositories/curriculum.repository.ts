// repositories/curriculum.repository.ts
import { MASTER_CATALOG } from "@/lib/data/master-catalog.data";
import { CountryEducationSystem, EducationSystem, EducationAuthority, CurriculumVersion } from "@/types/curriculum";
import type { ICurriculumRepository } from "@/interfaces/ICurriculumRepository";

export class CurriculumRepository implements ICurriculumRepository {
  async getAllCountries(): Promise<CountryEducationSystem[]> {
    return MASTER_CATALOG;
  }

  async getCountry(countryId: string): Promise<CountryEducationSystem | undefined> {
    return MASTER_CATALOG.find(c => c.id === countryId);
  }

  async getSystem(countryId: string, systemId: string): Promise<EducationSystem | undefined> {
    const country = await this.getCountry(countryId);
    return country?.systems.find(s => s.id === systemId);
  }

  async getAuthority(countryId: string, systemId: string, authorityId: string): Promise<EducationAuthority | undefined> {
    const system = await this.getSystem(countryId, systemId);
    return system?.authorities.find(a => a.id === authorityId);
  }

  async getCurriculumVersion(
    countryId: string, 
    systemId: string, 
    authorityId: string, 
    versionId: string
  ): Promise<CurriculumVersion | undefined> {
    const authority = await this.getAuthority(countryId, systemId, authorityId);
    return authority?.curriculumVersions.find(v => v.id === versionId);
  }
}
