// repositories/parents.repository.ts
import { BaseRepository } from "./base.repository";
import type { Parent } from "@/types/parents";
import type { IParentRepository } from "@/interfaces/IParentRepository";

export class ParentsRepository extends BaseRepository<Parent> implements IParentRepository {
  constructor() {
    super("parents");
  }
}
