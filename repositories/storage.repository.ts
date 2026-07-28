// repositories/storage.repository.ts
import { adminStorage } from "@/lib/firebase-admin";
import type { IStorageRepository } from "@/interfaces/IStorageRepository";

export class StorageRepository implements IStorageRepository {
  async uploadFile(buffer: Buffer, fileName: string, contentType: string, folder?: string): Promise<string> {
    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(folder ? `${folder}/${fileName}` : fileName);
    await fileRef.save(buffer, { contentType });
    await fileRef.makePublic();
    return `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(fileUrl);
    await fileRef.delete();
  }
}
