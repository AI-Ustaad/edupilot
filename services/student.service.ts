// services/student.service.ts

import { StudentRepository } from "@/repositories/student.repository";
import { Student } from "@/types/student";

type CreateStudentDto = Omit<
  Student,
  "id" | "tenantId" | "createdAt" | "updatedAt"
>;
export class StudentService {
  constructor(private repo: StudentRepository) {}

  // ----------------------------------------------------------------
  // CREATE
  // ----------------------------------------------------------------
  async createStudent(data: CreateStudentDto, tenantId: string): Promise<Student> {
    // 1. Validate / sanitize input (you may already have a validation method)
    const validated = this.validate(data);

    // 2. Create the document → repo returns the new document's ID (string)
    const id = await this.repo.create({ ...validated }, tenantId);

    // 3. Fetch the complete student object immediately so the API returns full data
    const student = await this.repo.getById(id, tenantId);
    if (!student) {
      throw new Error("Student created but could not be retrieved");
    }

    return student;
  }

  // ----------------------------------------------------------------
  // READ
  // ----------------------------------------------------------------
  async getStudentById(id: string, tenantId: string): Promise<Student | null> {
    return this.repo.getById(id, tenantId);
  }

  async listStudents(
    tenantId: string,
    page = 1,
    limit = 20
  ): Promise<{ data: Student[]; total: number }> {
    const offset = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.repo.list(tenantId, offset, limit),
      this.repo.count(tenantId),
    ]);
    return { data, total };
  }

  // ----------------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------------
  async updateStudent(
    id: string,
    updates: Partial<CreateStudentDto>,
    tenantId: string
  ): Promise<Student> {
    // Optionally validate partial data
    await this.repo.update(id, updates, tenantId);
    const updated = await this.repo.getById(id, tenantId);
    if (!updated) throw new Error("Student not found after update");
    return updated;
  }

  // ----------------------------------------------------------------
  // DELETE
  // ----------------------------------------------------------------
  async deleteStudent(id: string, tenantId: string): Promise<void> {
    await this.repo.delete(id, tenantId);
  }

  // ----------------------------------------------------------------
  // PRIVATE HELPERS
  // ----------------------------------------------------------------
  private validate(data: CreateStudentDto): CreateStudentDto {
    // Your validation logic here – e.g. check required fields, sanitize strings
    if (!data.fullName || !data.classGrade) {
      throw new Error("Missing required fields: fullName, classGrade");
    }
    return data;
  }
}
