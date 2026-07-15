import { adminAuth } from "@/lib/firebase-admin";
import { RequestContext } from "@/route-helpers/request-context";
import { UserRepository } from "@/repositories/user.repository";
import { ClaimsService } from "./claims.service";
import { InvalidTokenError } from "@/lib/auth/auth.errors";
import { ROLE_CONFIG } from "@/lib/auth/roles.config";
import { LoginResponseDto } from "@/types/auth";

export class AuthService {
  // Dependency Injection Flow
  constructor(
    private auth = adminAuth,
    private userRepo = new UserRepository(),
    private claimsService = new ClaimsService()
  ) {}

  async processLogin(idToken: string, context: RequestContext): Promise<LoginResponseDto> {
    let decodedToken;
    try {
      decodedToken = await this.auth.verifyIdToken(idToken);
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
