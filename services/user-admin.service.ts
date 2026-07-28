// services/user-admin.service.ts
import { UserRepository } from "@/repositories/user.repository";
import type { IUserRepository } from "@/interfaces/IUserRepository";
import type { SessionUser } from "@/types/auth";

export class UserAdminService {
  private repository: IUserRepository;

  constructor(repository?: IUserRepository) {
    this.repository = repository ?? new UserRepository();
  }

  async findAllByTenant(tenantId: string): Promise<SessionUser[]> {
    return this.repository.findAllByTenant(tenantId);
  }
}
