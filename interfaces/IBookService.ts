// interfaces/IBookService.ts
import type { Book } from "@/types/teacher";

export interface IBookService {
  listBooks(tenantId: string, filters?: { classGrade?: string; subject?: string }): Promise<(Book & { id: string })[]>;
  createBook(data: unknown, tenantId: string): Promise<Book>;
  getBookById(id: string, tenantId: string): Promise<(Book & { id: string }) | null>;
  updateBook(id: string, data: unknown, tenantId: string, userId: string): Promise<void>;
  deleteBook(id: string, tenantId: string, userId: string): Promise<void>;
}
