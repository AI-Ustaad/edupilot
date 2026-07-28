// repositories/auth.repository.ts
import { adminAuth } from "@/lib/firebase-admin";
import type { IAuthRepository } from "@/interfaces/IAuthRepository";

export class AuthRepository implements IAuthRepository {
  async verifyIdToken(idToken: string) {
    return adminAuth.verifyIdToken(idToken);
  }

  async verifySessionCookie(sessionCookie: string) {
    return adminAuth.verifySessionCookie(sessionCookie);
  }

  async createSessionCookie(idToken: string, expiresIn: any) {
    return adminAuth.createSessionCookie(idToken, { expiresIn });
  }

  async getUser(uid: string) {
    return adminAuth.getUser(uid);
  }

  async getUserByEmail(email: string) {
    return adminAuth.getUserByEmail(email);
  }

  async setCustomUserClaims(uid: string, claims: Record<string, any>) {
    return adminAuth.setCustomUserClaims(uid, claims);
  }

  async createCustomToken(uid: string, claims: Record<string, any>) {
    return adminAuth.createCustomToken(uid, claims);
  }

  async createUser(email: string, password: string) {
    return adminAuth.createUser({ email, password });
  }
}
