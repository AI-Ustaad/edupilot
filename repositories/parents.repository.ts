// repositories/parents.repository.ts
import { BaseRepository } from "./base.repository";
import { Parent } from "@/types/parents";

export class ParentsRepository extends BaseRepository<Parent> {
  constructor() {
    super("parents");
  }
}
