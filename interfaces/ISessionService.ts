// interfaces/ISessionService.ts
export interface ISessionService {
  createCookie(idToken: string): Promise<string>;
}
