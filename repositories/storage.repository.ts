// repositories/storage.repository.ts
import { adminStorage } from "@/lib/firebase-admin";
import type { IStorageRepository } from "@/interfaces/IStorageRepository";
import { logger } from "@/lib/logger/logger";

export class StorageRepository implements IStorageRepository {
  async uploadFile(
    buffer: Buffer,
    fileName: string,
    contentType: string,
    folder?: string,
    makePublic = false
  ): Promise<string> {
    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(folder ? `${folder}/${fileName}` : fileName);
    await fileRef.save(buffer, { contentType });

    if (makePublic) {
      try {
        await fileRef.makePublic();
        return `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;
      } catch (error: any) {
        logger.error("[StorageRepository] Failed to make file public", {
          metadata: { fileName: fileRef.name, error: error?.message },
        });
        throw new Error(`Failed to make file public: ${error?.message || "Unknown error"}`);
      }
    }

    try {
      const [signedUrl] = await fileRef.getSignedUrl({
        action: "read",
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
      });
      return signedUrl;
    } catch (error: any) {
      logger.error("[StorageRepository] Failed to generate signed URL for private file", {
        metadata: { fileName: fileRef.name, error: error?.message },
      });
      throw new Error(
        `Failed to generate secure signed URL for private file: ${error?.message || "Unknown error"}`
      );
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(fileUrl);
    await fileRef.delete();
  }
}
