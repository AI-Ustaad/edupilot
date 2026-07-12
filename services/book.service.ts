// services/book.service.ts
import { BookRepository } from "@/repositories/book.repository";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";
import { CreateBookSchema, UpdateBookSchema } from "@/validators/teacher";
import { invalidateCache } from "@/lib/cache";
import { eventBus } from "@/lib/events/event-bus";
import { EVENTS } from "@/lib/events/event-types";
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

  async createBook(data: unknown, tenantId: string): Promise<Book> {
    const parsed = this.validation.validateOrThrow(CreateBookSchema, data);

    const createData: Omit<Book, "id" | "createdAt" | "updatedAt"> = {
      ...parsed,
      tenantId,
    } as Omit<Book, "id" | "createdAt" | "updatedAt">;

    const id = await this.repo.create(createData, tenantId);
    const book = await this.repo.findById(id, tenantId);
    if (!book) throw new Error("Book created but could not be retrieved");
    await invalidateCache(`books:${tenantId}`);

    await this.audit.log({
      action: "book.created",
      userId: "system",
      tenantId,
      entityId: id,
      entityType: "book",
      metadata: { title: parsed.title, author: parsed.author },
    });

    eventBus.publish(EVENTS.BOOK_CREATED, {
      tenantId,
      bookId: id,
      title: parsed.title,
      author: parsed.author,
    });

    return book as Book;
  }

  async getBookById(id: string, tenantId: string): Promise<(Book & { id: string }) | null> {
    return this.repo.findById(id, tenantId);
  }

  async updateBook(id: string, data: unknown, tenantId: string, userId: string): Promise<void> {
    const parsed = this.validation.validateOrThrow(UpdateBookSchema, data);
    await this.repo.update(id, parsed, tenantId);
    await invalidateCache(`books:${tenantId}`);

    await this.audit.log({
      action: "book.updated",
      userId,
      tenantId,
      entityId: id,
      entityType: "book",
      metadata: { updates: parsed },
    });

    eventBus.publish(EVENTS.BOOK_UPDATED, {
      tenantId,
      bookId: id,
      updates: parsed,
      updatedBy: userId,
    });
  }

  async deleteBook(id: string, tenantId: string, userId: string): Promise<void> {
    await this.repo.delete(id, tenantId);
    await invalidateCache(`books:${tenantId}`);

    await this.audit.log({
      action: "book.deleted",
      userId,
      tenantId,
      entityId: id,
      entityType: "book",
    });

    eventBus.publish(EVENTS.BOOK_DELETED, {
      tenantId,
      bookId: id,
      deletedBy: userId,
    });
  }
}
