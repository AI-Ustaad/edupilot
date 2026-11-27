// services/syllabus.service.ts
import { SyllabusRepository } from "@/repositories/syllabus.repository";
import type { ISyllabusRepository } from "@/interfaces/ISyllabusRepository";
import type { Syllabus } from "@/repositories/syllabus.repository";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";
import { createSyllabusSchema } from "@/lib/validation/syllabus.schema";

export class SyllabusService {
  private repository: ISyllabusRepository;
  private audit: AuditService;
  private validation: ValidationService;

  constructor(repository?: ISyllabusRepository) {
    this.repository = repository ?? new SyllabusRepository();
    this.audit = new AuditService();
    this.validation = new ValidationService();
  }

  // B11 (26 Nov audit): Add Material silently failed — the client POSTs to
  // /api/v1/syllabus but no create path existed anywhere (no POST route, no
  // service method), so the request 405'd and the page showed nothing.
  async createSyllabus(data: unknown, tenantId: string, userId: string): Promise<Syllabus & { id: string }> {
    const parsed = this.validation.validateOrThrow(createSyllabusSchema, data);

    const id = await this.repository.create(
      {
        ...parsed,
        tenantId,
        createdBy: userId,
        deleted: false,
      },
      tenantId
    );
    const record = await this.repository.findById(id, tenantId);
    if (!record) throw new Error("Syllabus not found after creation");

    await this.audit.log({
      action: "syllabus.created",
      userId,
      tenantId,
      entityId: id,
      entityType: "syllabus",
      metadata: { title: parsed.title, classGrade: parsed.classGrade, subject: parsed.subject },
    });

    return record as Syllabus & { id: string };
  }

  async findWithFilters(tenantId: string, filters?: { classGrade?: string; subject?: string }): Promise<(Syllabus & { id: string })[]> {
    return this.repository.findWithFilters(tenantId, filters);
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    return this.repository.softDelete(id, tenantId);
  }

  async updateSyllabus(id: string, tenantId: string, data: Partial<Syllabus>): Promise<void> {
    return this.repository.updateSyllabus(id, tenantId, data);
  }
}
