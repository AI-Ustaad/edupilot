// interfaces/ISettingsRepository.ts
export interface ISettingsRepository {
  getConfig(...args: any[]): Promise<any>;
  getConfigurationHistory(...args: any[]): Promise<any>;
  getGeneral(...args: any[]): Promise<any>;
  saveConfigurationWithHistory(...args: any[]): Promise<any>;
  updateConfig(...args: any[]): Promise<any>;
  updateGeneral(...args: any[]): Promise<any>;
}
