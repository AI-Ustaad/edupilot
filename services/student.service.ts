import { BaseService } from "./base.service";
import { StudentRepository } from "@/repositories/student.repository";
import { createStudentSchema } from "@/lib/validation/student.schema";
import { AppError } from "@/lib/errors/AppError";
import { Student } from "@/types/student";

export class StudentService extends BaseService {
  constructor(private repo: StudentRepository) {
    super();
  }

  async createStudent(
    input: unknown,
    tenantId: string
  ): Promise<Student> {
    const validated = createStudentSchema.parse(input);

    const existing = await this.repo.findByRollNumber(
      validated.rollNumber,
      tenantId
    );

    if (existing) {
      throw new AppError(
        "Roll number already exists in this school",
        409
      );
    }

    const id = await this.repo.create(
      validated as any,
      tenantId
    );

    const student = await this.repo.findById(id, tenantId);

    if (!student) {
      throw new AppError(
        "Student created but could not be retrieved",
        500
      );
    }

    return student as Student;
  }

  async listStudents(
    tenantId: string,
    page = 1,
    limit = 20
  ) {
    const students = await this.repo.findAll(tenantId);

    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      data: students.slice(start, end),
      total: students.length,
      page,
      limit,
    };
  }

  async countStudents(
    tenantId: string
  ): Promise<number> {
    const students = await this.repo.findAll(tenantId);
    return students.length;
  }

  async getStudentById(
    id: string,
    tenantId: string
  ): Promise<Student | null> {
    return this.repo.findById(id, tenantId) as Promise<Student | null>;
  }

  async updateStudent(
    id: string,
    input: unknown,
    tenantId: string
  ): Promise<void> {
    const validated = createStudentSchema.partial().parse(input);

    await this.repo.update(
      id,
      validated as Partial<Student>,
      tenantId
    );
  }

  async deleteStudent(
    id: string,
    tenantId: string
  ): Promise<void> {
    await this.repo.delete(id, tenantId);
  }
}
