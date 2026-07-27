import { AuthRepository } from "@/repositories/auth.repository";
import { SESSION_EXPIRES_IN_MS } from "@/lib/auth/roles.config";
import type { ISessionService } from "@/interfaces/ISessionService";

export class SessionService implements ISessionService {
  constructor(private authRepo = new AuthRepository()) {}

  async createCookie(idToken: string): Promise<string> {
    return await this.authRepo.createSessionCookie(idToken, { expiresIn: SESSION_EXPIRES_IN_MS });
  }
}
