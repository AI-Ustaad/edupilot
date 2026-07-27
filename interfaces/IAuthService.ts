// interfaces/IAuthService.ts
import type { RequestContext } from "@/route-helpers/request-context";
import type { LoginResponseDto } from "@/types/auth";

export interface IAuthService {
  processLogin(idToken: string, context: RequestContext): Promise<LoginResponseDto>;
  createUser(email: string, password: string, claims: Record<string, any>): Promise<{ uid: string }>;
  getUserByEmail(email: string): Promise<any>;
  createCustomToken(uid: string, claims: Record<string, any>): Promise<string>;
  verifySessionCookie(sessionCookie: string): Promise<any>;
  setCustomUserClaims(uid: string, claims: Record<string, any>): Promise<void>;
}
