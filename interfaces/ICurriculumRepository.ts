// interfaces/ICurriculumRepository.ts
export interface ICurriculumRepository {
  getAllCountries(...args: any[]): Promise<any>;
  getAuthority(...args: any[]): Promise<any>;
  getCountry(...args: any[]): Promise<any>;
  getCurriculumVersion(...args: any[]): Promise<any>;
  getSystem(...args: any[]): Promise<any>;
}
