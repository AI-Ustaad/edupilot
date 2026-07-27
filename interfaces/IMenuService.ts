// interfaces/IMenuService.ts
export interface IMenuService {
  getMenuForUser(role: string, permissions?: string[], disabledFeatures?: string[]): Promise<any[]>;
}
