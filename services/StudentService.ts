// services/StudentService.ts

import { CreateStudentSchema } from "@/validators/student";
import { StudentPersistenceMapper } from "@/mappers/StudentPersistenceMapper";
import { BusinessError } from "@/errors";
// آپ کی ریپوزٹری کا امپورٹ (اگر آپ کے پراجیکٹ میں راست مختلف ہو تو اسے ایڈجسٹ کر لیں)
import { StudentRepository } from "@/repositories/student.repository"; 

export class StudentService {
  private repository: StudentRepository;

  constructor() {
    // اگر آپ کی ریپوزٹری ایک سٹیٹک کلاس ہے تو اسے اسٹیٹک کال کریں،
    // ورنہ یہاں نیا انسٹینس بنا رہے ہیں۔
    this.repository = new StudentRepository(); 
  }

  /**
   * Create Student Use-Case (Enterprise Flow)
   */
  async create(data: any, tenantId: string, userId: string) {
    // 1. Direct Zod Parse (ZodError will be caught by withErrorHandler)
    const validatedAggregate = CreateStudentSchema.parse(data);

    // 2. Map the validated Aggregate to Legacy Flat Firestore Document
    const document = StudentPersistenceMapper.toFirestore(validatedAggregate, userId);

    // 3. Duplicate Check (To be replaced by Transaction in Phase 3)
    if (document.rollNumber) {
      const existing = await this.repository.findByRollNumber(document.rollNumber, tenantId);
      if (existing) {
        throw new BusinessError(`Student with roll number ${document.rollNumber} already exists`);
      }
    }

    // 4. Save to Repository
    const savedDoc = await this.repository.save({
      ...document,
      tenantId,
    }, tenantId);
    
    // 5. Return Mapped Entity (Phase 6 Readiness)
    return StudentPersistenceMapper.fromFirestore(savedDoc);
  }

  // ... (آپ کے باقی پرانے میتھڈز جیسے getById, paginate وغیرہ یہاں نیچے رہ سکتے ہیں)
}
