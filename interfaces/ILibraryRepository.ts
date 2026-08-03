import type { LibraryDocument } from "@/documents/LibraryDocument";

export interface ILibraryRepository {
  getAll(tenantId: string): Promise<(LibraryDocument & { id: string })[]>;
  create(data: LibraryDocument, tenantId: string): Promise<string>;
  update(id: string, data: Partial<LibraryDocument>, tenantId: string): Promise<void>;
  softDelete(id: string, tenantId: string): Promise<void>;
}
