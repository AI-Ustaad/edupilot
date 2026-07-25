// repositories/parents.repository.ts
import { BaseRepository } from "./base.repository";
import type { ParentDocument } from "@/documents/ParentDocument";
import type { IParentRepository } from "@/interfaces/IParentRepository";
import type { PaginatedResult } from "@/types/api";
import { RepositoryException } from "@/errors/AppError";

export class ParentsRepository extends BaseRepository<ParentDocument> implements IParentRepository {
  constructor() {
    super("parents");
  }

  async save(document: ParentDocument, tenantId: string): Promise<ParentDocument> {
    try {
      if (document.id) {
        await this.update(document.id, document, tenantId);
        const updated = await this.findById(document.id, tenantId);
        if (!updated) throw new Error("Parent not found after update.");
        return updated;
      } else {
        const newId = await this.create(document, tenantId);
        const created = await this.findById(newId, tenantId);
        if (!created) throw new Error("Parent not found after create.");
        return created;
      }
    } catch (error) {
      throw new RepositoryException("Failed to save parent", { tenantId, docId: document.id });
    }
  }
}
