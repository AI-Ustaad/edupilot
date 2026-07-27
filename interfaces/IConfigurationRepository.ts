// interfaces/IConfigurationRepository.ts
export interface IConfigurationRepository {
  getActiveConfiguration(...args: any[]): Promise<any>;
  getConfig(...args: any[]): Promise<any>;
  getConfigurationHistory(...args: any[]): Promise<any>;
  getGeneral(...args: any[]): Promise<any>;
  saveConfiguration(...args: any[]): Promise<any>;
  updateConfig(...args: any[]): Promise<any>;
  updateGeneral(...args: any[]): Promise<any>;
}
