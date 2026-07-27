// services/upload.service.ts
import { StorageRepository } from "@/repositories/storage.repository";

export class UploadService {
  private storageRepo: StorageRepository;

  constructor(storageRepo = new StorageRepository()) {
    this.storageRepo = storageRepo;
  }

  async uploadFile(buffer: Buffer, fileName: string, contentType: string, folder?: string): Promise<string> {
    return this.storageRepo.uploadFile(buffer, fileName, contentType, folder);
  }
}
