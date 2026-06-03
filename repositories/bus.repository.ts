import { BaseRepository } from "./base.repository";
import { Bus } from "@/types/bus";

export class BusRepository extends BaseRepository<Bus> {
  constructor() {
    super("buses");
  }
}
