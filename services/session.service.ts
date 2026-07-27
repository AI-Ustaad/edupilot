import { AuthRepository } from "@/repositories/auth.repository";
import { SESSION_EXPIRES_IN_MS } from "@/lib/auth/roles.config";
import type { ISessionService } from "@/interfaces/ISessionService";

export class SessionService implements ISessionService {
  constructor(private authRepo = new AuthRepository()) {}

  async createCookie(idToken: string): Promise<string> {
    return this.authRepo.createSessionCookie(
      idToken,
      SESSION_EXPIRES_IN_MS
    );
  }
}
