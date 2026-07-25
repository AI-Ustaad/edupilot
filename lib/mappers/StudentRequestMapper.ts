// mappers/StudentRequestMapper.ts
import type { CreateStudentDTO } from "@/dto/CreateStudentDTO";
from "@/entities/student.entity"
import { StudentPersistenceMapper } from "./StudentPersistenceMapper"; // Re-use logic to avoid duplication

export class StudentRequestMapper {
  static toEntity(dto: CreateStudentDTO): Partial<StudentEntity> {
    // We delegate this to Persistence Mapper to avoid duplicate mapping code
    return StudentPersistenceMapper.fromDTO(dto);
  }
}
