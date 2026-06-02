// repositories/homework.repository.ts
import { BaseRepository } from "./base.repository";
import { Homework } from "@/types/homework";

export class HomeworkRepository extends BaseRepository<Homework> {
  constructor() {
    super("homework");
  }
}
