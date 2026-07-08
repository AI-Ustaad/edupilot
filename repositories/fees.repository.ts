// repositories/fees.repository.ts
import { BaseRepository } from "./base.repository";
import type { Fee } from "@/types/fees";
import type { IFeesRepository } from "@/interfaces/IFeesRepository";

export class FeesRepository extends BaseRepository<Fee> implements IFeesRepository {
  constructor() {
    super("fees");
  }
}
