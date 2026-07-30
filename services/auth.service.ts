import { RequestContext } from "@/route-helpers/request-context";
import { UserRepository } from "@/repositories/user.repository";
import { AuthRepository } from "@/repositories/auth.repository";
import { ClaimsService } from "./claims.service";
import { InvalidTokenError } from "@/lib/auth/auth.errors";
import { ROLE_CONFIG } from "@/lib/auth/roles.config";
import { LoginResponseDto } from "@/types/auth";
import type { IAuthService } from "@/interfaces/IAuthService";
import type { SessionUser, Role } from "@/types/auth";

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

  async findUserWithFallback(uid: string, email?: string, context?: RequestContext): Promise<SessionUser> {
    return this.userRepo.findByUidWithFallback(uid, email, context);
  }

  async registerUser(email: string, password: string, role: Role, tenantId: string | null): Promise<{ uid: string; user: SessionUser }> {
    const { uid } = await this.createUser(email, password, { role, tenantId });
    await this.userRepo.create({
      uid,
      email,
      role,
      tenantId,
      createdAt: new Date(),
    });
    const user = await this.findUserWithFallback(uid, email);
    return { uid, user };
  }

  async updateUserRole(uid: string, role: Role, tenantId: string): Promise<void> {
    await this.userRepo.updateRole(uid, role, tenantId);
    await this.authRepo.setCustomUserClaims(uid, { role, tenantId });
  }

  async getOrCreateUser(uid: string, email?: string, role: Role = "guest", tenantId: string | null = null): Promise<{ user: SessionUser; created: boolean }> {
    try {
      const existing = await this.findUserWithFallback(uid, email);
      return { user: existing, created: false };
    } catch {
      await this.userRepo.create({
        uid,
        email: email || "",
        role,
        tenantId,
        createdAt: new Date(),
      });
      const created = await this.findUserWithFallback(uid, email);
      return { user: created, created: true };
    }
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
