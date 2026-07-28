// interfaces/IAuthRepository.ts
export interface IAuthRepository {
  verifyIdToken(idToken: string): Promise<any>;
  verifySessionCookie(sessionCookie: string): Promise<any>;
  createSessionCookie(idToken: string, expiresIn: any): Promise<any>;
  getUser(uid: string): Promise<any>;
  getUserByEmail(email: string): Promise<any>;
  setCustomUserClaims(uid: string, claims: Record<string, any>): Promise<void>;
  createCustomToken(uid: string, claims: Record<string, any>): Promise<string>;
  createUser(email: string, password: string): Promise<any>;
}
