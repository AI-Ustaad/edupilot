// repositories/book.repository.ts
import { BaseRepository } from "./base.repository";
import type { Book } from "@/types/teacher";
import type { IBookRepository } from "@/interfaces/IBookRepository";

export class BookRepository extends BaseRepository<Book> implements IBookRepository {
  constructor() {
    super("books");
  }

  async findByFilter(tenantId: string, filters: { classGrade?: string; subject?: string }): Promise<(Book & { id: string })[]> {
    let query: FirebaseFirestore.Query = this.db.collection(this.collectionName);
    query = query.where("tenantId", "==", tenantId);
    if (filters.classGrade) query = query.where("classGrade", "==", filters.classGrade);
    if (filters.subject) query = query.where("subject", "==", filters.subject);
    query = query.orderBy("title");
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book & { id: string }));
  }
}
