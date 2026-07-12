import { BaseRepository } from "./base.repository";
import { Bus } from "@/types/bus";
import type { IBusRepository } from "@/interfaces/IBusRepository";

export class BusRepository extends BaseRepository<Bus> implements IBusRepository {
  constructor() {
    super("buses");
  }
}
