import { RequestContext } from "@/route-helpers/request-context";
import { UserRepository } from "@/repositories/user.repository";
import { AuthRepository } from "@/repositories/auth.repository";
import { ClaimsService } from "./claims.service";
import { InvalidTokenError } from "@/lib/auth/auth.errors";
import { ROLE_CONFIG } from "@/lib/auth/roles.config";
import { LoginResponseDto } from "@/types/auth";
import type { IAuthService } from "@/interfaces/IAuthService";

export class AuthService implements IAuthService {
  constructor(
    private authRepo = new AuthRepository(),
    private userRepo = new UserRepository(),
    private claimsService = new ClaimsService()
  ) {}

  async createUser(email: string, password: string, claims: Record<string, any>): Promise<{ uid: string }> {
    const newUser = await this.authRepo.createUser(email, password);
    await this.authRepo.setCustomUserClaims(newUser.uid, claims);
    return { uid: newUser.uid };
  }

  async getUserByEmail(email: string) {
    return this.authRepo.getUserByEmail(email);
  }

  async createCustomToken(uid: string, claims: Record<string, any>) {
    return this.authRepo.createCustomToken(uid, claims);
  }

  async verifySessionCookie(sessionCookie: string) {
    return this.authRepo.verifySessionCookie(sessionCookie);
  }

  async setCustomUserClaims(uid: string, claims: Record<string, any>) {
    return this.authRepo.setCustomUserClaims(uid, claims);
  }

  async processLogin(idToken: string, context: RequestContext): Promise<LoginResponseDto> {
    let decodedToken;
    try {
      decodedToken = await this.authRepo.verifyIdToken(idToken);
    } catch (error) {
      throw new InvalidTokenError();
    }

    const sessionUser = await this.userRepo.findByUidWithFallback(decodedToken.uid, decodedToken.email, context);
    await this.claimsService.sync(sessionUser, context);

    const redirectTo = ROLE_CONFIG[sessionUser.role]?.redirect || "/login";

    return {
      success: true,
      message: "Authentication successful",
      user: sessionUser,
      redirectTo,
    };
  }
}
