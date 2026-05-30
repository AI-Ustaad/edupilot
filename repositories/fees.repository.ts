// repositories/fees.repository.ts
import { BaseRepository } from "./base.repository";
import { Fee } from "@/types/fees";

export class FeesRepository extends BaseRepository<Fee> {
  constructor() {
    super("fees");
  }

  // اگر کسٹم میتھڈز چاہیے، مثلاً findByStudentId، تو یہاں لکھ سکتے ہیں
}
