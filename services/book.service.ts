// services/book.service.ts
import { BookRepository } from "@/repositories/book.repository";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";
import { CreateBookSchema, UpdateBookSchema } from "@/validators/teacher";
import type { IBookRepository } from "@/interfaces/IBookRepository";
import type { Book } from "@/types/teacher";

export class BookService {
  private audit: AuditService;
  private validation: ValidationService;

  constructor(private repo: IBookRepository = new BookRepository()) {
    this.audit = new AuditService();
    this.validation = new ValidationService();
  }

  async listBooks(tenantId: string, filters?: { classGrade?: string; subject?: string }): Promise<(Book & { id: string })[]> {
    if (filters?.classGrade || filters?.subject) {
      return this.repo.findByFilter(tenantId, filters);
    }
    return this.repo.findAll(tenantId);
  }

  async getBookById(id: string, tenantId: string): Promise<(Book & { id: string }) | null> {
    return this.repo.findById(id, tenantId);
  }

  async updateBook(id: string, data: unknown, tenantId: string, userId: string): Promise<void> {
    const parsed = this.validation.validateOrThrow(UpdateBookSchema, data);
    await this.repo.update(id, parsed, tenantId);

    await this.audit.log({
      action: "book.updated",
      userId,
      tenantId,
      entityId: id,
      entityType: "book",
      metadata: { updates: parsed },
    });
  }

  async deleteBook(id: string, tenantId: string, userId: string): Promise<void> {
    await this.repo.delete(id, tenantId);

    await this.audit.log({
      action: "book.deleted",
      userId,
      tenantId,
      entityId: id,
      entityType: "book",
    });
  }
}
