import { StudentRepository } from "@/repositories/student.repository";
import { Student } from "@/types/student";

export type CreateStudentDto = Omit<
  Student,
  "id" | "tenantId" | "createdAt" | "updatedAt"
>;

export class StudentService {
  constructor(private repo: StudentRepository) {}

  async createStudent(
    data: CreateStudentDto,
    tenantId: string
  ): Promise<Student> {
    const validated = this.validate(data);

    const id = await this.repo.create(
      {
        ...validated,
        tenantId,
      } as Omit<Student, "id" | "createdAt" | "updatedAt">,
      tenantId
    );

    const student = await this.repo.findById(id, tenantId);

    if (!student) {
      throw new Error("Student created but could not be retrieved");
    }

    return student as Student;
  }

  async getStudentById(
    id: string,
    tenantId: string
  ): Promise<Student | null> {
    return (await this.repo.findById(id, tenantId)) as Student | null;
  }

  async listStudents(
    tenantId: string
  ): Promise<Student[]> {
    return (await this.repo.findAll(tenantId)) as Student[];
  }

  async updateStudent(
    id: string,
    updates: Partial<CreateStudentDto>,
    tenantId: string
  ): Promise<Student> {
    await this.repo.update(id, updates, tenantId);

    const updated = await this.repo.findById(id, tenantId);

    if (!updated) {
      throw new Error("Student not found after update");
    }

    return updated as Student;
  }

  async deleteStudent(
    id: string,
    tenantId: string
  ): Promise<void> {
    await this.repo.delete(id, tenantId);
  }

  private validate(
    data: CreateStudentDto
  ): CreateStudentDto {
    if (!data.fullName || !data.classGrade) {
      throw new Error(
        "Missing required fields: fullName, classGrade"
      );
    }

    return data;
  }
}
