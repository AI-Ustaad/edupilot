// services/student.service.ts
import { StudentRepository } from "@/repositories/student.repository";
import { Student } from "@/types/student";
import { createStudentSchema, updateStudentSchema, CreateStudentInput, UpdateStudentInput } from "@/validation/student.schema";
import { ZodError } from "zod";

type CreateStudentDto = Omit<Student, "id" | "tenantId" | "createdAt" | "updatedAt">;

export class StudentService {
  constructor(private repo: StudentRepository) {}

  async createStudent(data: unknown, tenantId: string): Promise<Student> {
    // Zod validation
    let validated: CreateStudentInput;
    try {
      validated = createStudentSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }

    const createData = {
      ...validated,
      tenantId,
    } as Omit<Student, "id" | "createdAt" | "updatedAt">;

    const id = await this.repo.create(createData, tenantId);
    const student = await this.repo.findById(id, tenantId);
    if (!student) throw new Error("Student created but could not be retrieved");
    return student as Student;
  }

  async getStudentById(id: string, tenantId: string): Promise<Student | null> {
    return this.repo.findById(id, tenantId);
  }

  async listStudents(
    tenantId: string,
    page = 1,
    limit = 20
  ) {
    return this.repo.paginate(tenantId, page, limit, 'createdAt', 'desc');
  }

  async updateStudent(
    id: string,
    data: unknown,
    tenantId: string
  ): Promise<Student> {
    let validated: UpdateStudentInput;
    try {
      validated = updateStudentSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }

    await this.repo.update(id, validated, tenantId);
    const updated = await this.repo.findById(id, tenantId);
    if (!updated) throw new Error("Student not found after update");
    return updated as Student;
  }

  async deleteStudent(id: string, tenantId: string): Promise<void> {
    // Enterprise soft delete
    await this.repo.softDelete(id, tenantId);
  }

  async hardDeleteStudent(id: string, tenantId: string): Promise<void> {
    // Only for super admin or special cases
    await this.repo.delete(id, tenantId);
  }

  async countStudents(tenantId: string): Promise<number> {
    return this.repo.count(tenantId);
  }
}
