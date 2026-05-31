import { StudentRepository } from "@/repositories/student.repository";
import { Student } from "@/types/student";
import {
  createStudentSchema,
  updateStudentSchema,
  CreateStudentInput,
  UpdateStudentInput,
} from "@/lib/validation";
import { ZodError } from "zod";
import { deleteCache, studentListKey, dashboardKey } from "@/lib/cache/cache";

type CreateStudentDto = Omit<Student, "id" | "tenantId" | "createdAt" | "updatedAt">;

export class StudentService {
  constructor(private repo: StudentRepository) {}

  async createStudent(data: unknown, tenantId: string): Promise<Student> {
    let validated: CreateStudentInput;
    try {
      validated = createStudentSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }

    const createData = { ...validated, tenantId } as Omit<Student, "id" | "createdAt" | "updatedAt">;
    const id = await this.repo.create(createData, tenantId);
    const student = await this.repo.findById(id, tenantId);
    if (!student) throw new Error("Student created but could not be retrieved");

    // Cache invalidation
    await deleteCache(studentListKey(tenantId));
    await deleteCache(dashboardKey(tenantId));

    return student as Student;
  }

  async getStudentById(id: string, tenantId: string): Promise<Student | null> {
    return this.repo.findById(id, tenantId);
  }

  async listStudents(tenantId: string, page = 1, limit = 20) {
    // (اختیاری: یہاں cache پڑھنا شامل کر سکتے ہیں، لیکن pagination کی وجہ سے چھوڑ رہے ہیں)
    return this.repo.paginate(tenantId, page, limit, "createdAt", "desc");
  }

  async updateStudent(id: string, data: unknown, tenantId: string): Promise<Student> {
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

    // Cache invalidation
    await deleteCache(studentListKey(tenantId));
    await deleteCache(dashboardKey(tenantId));

    return updated as Student;
  }

  async deleteStudent(id: string, tenantId: string): Promise<void> {
    await this.repo.softDelete(id, tenantId);

    // Cache invalidation
    await deleteCache(studentListKey(tenantId));
    await deleteCache(dashboardKey(tenantId));
  }

  async hardDeleteStudent(id: string, tenantId: string): Promise<void> {
    await this.repo.delete(id, tenantId);

    await deleteCache(studentListKey(tenantId));
    await deleteCache(dashboardKey(tenantId));
  }

  async countStudents(tenantId: string): Promise<number> {
    return this.repo.count(tenantId);
  }
}
