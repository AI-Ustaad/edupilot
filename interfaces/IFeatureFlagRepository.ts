// interfaces/IFeatureFlagRepository.ts
export interface IFeatureFlagRepository {
  findByTenant(...args: any[]): Promise<any>;
  getAllFlags(...args: any[]): Promise<any>;
  setFeature(...args: any[]): Promise<any>;
}
