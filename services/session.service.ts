import { adminAuth } from "@/lib/firebase-admin";
import { SESSION_EXPIRES_IN_MS } from "@/lib/auth/roles.config";

export class SessionService {
  constructor(private auth = adminAuth) {}

  async createCookie(idToken: string): Promise<string> {
    return await this.auth.createSessionCookie(idToken, { expiresIn: SESSION_EXPIRES_IN_MS });
  }
}
