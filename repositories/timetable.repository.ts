// repositories/timetable.repository.ts
import { BaseRepository } from "./base.repository";
import type { TimetableEntry } from "@/types/timetable";
import type { ITimetableRepository } from "@/interfaces/ITimetableRepository";

export class TimetableRepository extends BaseRepository<TimetableEntry> implements ITimetableRepository {
  constructor() {
    super("timetable_entries");
  }
}
