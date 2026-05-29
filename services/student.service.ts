import { BaseService } from "./base.service";
import { StudentRepository } from "@/repositories/student.repository";
import { CreateStudentSchema } from "@/lib/validation/student.schema";
import { AppError } from "@/lib/errors/AppError";
import { Student } from "@/types/student";

export class StudentService extends BaseService {
  constructor(private repo: StudentRepository) {
    super();
  }

  // --------------------------------------------------
  // CREATE
  // --------------------------------------------------
  async createStudent(
    input: unknown,
    tenantId: string
  ): Promise<Student> {
    const validated = CreateStudentSchema.parse(input);

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
      {
        ...validated,
        tenantId,
      } as any,
      tenantId
    );

    const student = await this.repo.findById(
      id,
      tenantId
    );

    if (!student) {
      throw new AppError(
        "Student created but retrieval failed",
        500
      );
    }

    return student as Student;
  }

  // --------------------------------------------------
  // LIST
  // --------------------------------------------------
  async listStudents(
    tenantId: string,
    page = 1,
    limit = 20
  ) {
    return await this.repo.paginate(
      tenantId,
      page,
      limit
    );
  }

  // --------------------------------------------------
  // GET BY ID
  // --------------------------------------------------
  async getStudentById(
    id: string,
    tenantId: string
  ): Promise<Student | null> {
    return (await this.repo.findById(
      id,
      tenantId
    )) as Student | null;
  }

  // --------------------------------------------------
  // UPDATE
  // --------------------------------------------------
  async updateStudent(
    id: string,
    input: unknown,
    tenantId: string
  ): Promise<void> {
    const validated =
      CreateStudentSchema.partial().parse(input);

    await this.repo.update(
      id,
      validated,
      tenantId
    );
  }

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------
  async deleteStudent(
    id: string,
    tenantId: string
  ): Promise<void> {
    await this.repo.delete(
      id,
      tenantId
    );
  }
}
