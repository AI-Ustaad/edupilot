// repositories/storage.repository.ts
import { randomUUID } from "crypto";
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
        // B12: Firebase Storage buckets created with uniform bucket-level
        // access (the Firebase default) reject object-level ACLs, so
        // makePublic() fails even though the object was stored. Fall back
        // to a Firebase download-token URL: it serves the stored object
        // without ACLs and never expires. Never fabricate a URL for an
        // object that was not stored, and never swallow a real storage
        // failure — if the token cannot be attached either, throw.
        try {
          const token = randomUUID();
          await fileRef.setMetadata({
            metadata: { firebaseStorageDownloadTokens: token },
          });
          return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileRef.name)}?alt=media&token=${token}`;
        } catch (fallbackError: any) {
          logger.error("[StorageRepository] Failed to make file public", {
            metadata: { fileName: fileRef.name, error: error?.message, fallbackError: fallbackError?.message },
          });
          throw new Error(`Failed to make file public: ${error?.message || "Unknown error"}`);
        }
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
