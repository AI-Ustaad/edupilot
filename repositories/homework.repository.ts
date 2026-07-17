// repositories/homework.repository.ts
import { BaseRepository } from "./base.repository";
import { Homework } from "@/types/homework";
import type { IHomeworkRepository } from "@/interfaces/IHomeworkRepository";

export class HomeworkRepository extends BaseRepository<Homework> implements IHomeworkRepository {
  constructor() {
    super("homework");
  }
}
