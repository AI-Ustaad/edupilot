// services/student.service.ts
import { BaseService } from "./base.service";
import { StudentRepository } from "@/repositories/student.repository";
import { CreateStudentSchema } from "@/lib/validation/student.schema";
import { AppError } from "@/lib/errors/AppError";
import { Student } from "@/types/student";

export class StudentService extends BaseService {
  constructor(private repo: StudentRepository) {
    super();
  }

  async createStudent(input: unknown, tenantId: string): Promise<Student> {
    const validated = CreateStudentSchema.parse(input);

    // Check duplicate roll number within tenant
    const existing = await this.repo.findByRollNumber(validated.rollNumber, tenantId);
    if (existing) {
      throw new AppError("Roll number already exists in this school", 409);
    }

    return this.repo.create({ ...validated }, tenantId);
  }

  async listStudents(tenantId: string, page = 1, limit = 20) {
    return this.repo.paginate(tenantId, page, limit);
  }

  async getStudentById(id: string, tenantId: string): Promise<Student | null> {
    return this.repo.findById(id, tenantId);
  }

  async updateStudent(id: string, input: unknown, tenantId: string): Promise<void> {
    const validated = CreateStudentSchema.partial().parse(input);
    await this.repo.update(id, validated, tenantId);
  }

  async deleteStudent(id: string, tenantId: string): Promise<void> {
    await this.repo.delete(id, tenantId);
  }
}
