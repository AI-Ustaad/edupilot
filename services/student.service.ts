import { StudentRepository } from "@/repositories/student.repository";
import { Student } from "@/types/student";

// وہ تمام فیلڈز جو یوزر بھیج سکتا ہے (سسٹم فیلڈز نکال کر)
type CreateStudentDto = Omit<
  Student,
  "id" | "tenantId" | "createdAt" | "updatedAt"
>;

export class StudentService {
  constructor(private repo: StudentRepository) {}

  // ------------------ CREATE ------------------
  async createStudent(data: CreateStudentDto, tenantId: string): Promise<Student> {
    const validated = this.validate(data);

    // BaseRepository.create کی توقع کے مطابق tenantId کو بھی آبجیکٹ میں ڈالیں
    const createData = {
      ...validated,
      tenantId,
    } as Omit<Student, "id" | "createdAt" | "updatedAt">;

    const id = await this.repo.create(createData, tenantId);
    const student = await this.repo.findById(id, tenantId);
    if (!student) throw new Error("Student created but could not be retrieved");
    return student as Student;
  }

  // ------------------ READ ------------------
  async getStudentById(id: string, tenantId: string): Promise<Student | null> {
    return this.repo.findById(id, tenantId);
  }

  async listStudents(tenantId: string): Promise<Student[]> {
    return (await this.repo.findAll(tenantId)) as Student[];
  }

  // ------------------ UPDATE ------------------
  async updateStudent(
    id: string,
    updates: Partial<CreateStudentDto>,
    tenantId: string
  ): Promise<Student> {
    await this.repo.update(id, updates, tenantId);
    const updated = await this.repo.findById(id, tenantId);
    if (!updated) throw new Error("Student not found after update");
    return updated as Student;
  }

  // ------------------ DELETE ------------------
  async deleteStudent(id: string, tenantId: string): Promise<void> {
    await this.repo.delete(id, tenantId);
  }

  // ------------------ VALIDATION ------------------
  private validate(data: CreateStudentDto): CreateStudentDto {
    if (!data.fullName || !data.classGrade) {
      throw new Error("Missing required fields: fullName, classGrade");
    }
    return data;
  }
}
