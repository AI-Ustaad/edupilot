import { BaseRepository } from "./base.repository";
import type { LibraryDocument } from "@/documents/LibraryDocument";
import type { ILibraryRepository } from "@/interfaces/ILibraryRepository";

export class LibraryRepository extends BaseRepository<LibraryDocument> implements ILibraryRepository {
  constructor() {
    super("library_config");
  }

  async getAll(tenantId: string) {
    const snapshot = await this.db.collection(this.collectionName).where("tenantId", "==", tenantId).where("deleted", "==", false).limit(1).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LibraryDocument & { id: string }));
  }
}
