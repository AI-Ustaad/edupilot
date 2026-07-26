// lib/storage/providers/firebase-storage.provider.ts
import { IStorageProvider, StorageFile, StorageOptions } from "../storage";
import { adminStorage } from "@/lib/firebase-admin";

export class FirebaseStorageProvider implements IStorageProvider {
  private bucket: string;

  constructor(bucketName?: string) {
    this.bucket = bucketName || process.env.FIREBASE_STORAGE_BUCKET || "edupilot.appspot.com";
  }

  async upload(file: Buffer, filename: string, options: StorageOptions): Promise<StorageFile> {
    const path = `tenants/${options.tenantId}/${options.folder || "files"}/${Date.now()}_${filename}`;
    const bucket = adminStorage.bucket(this.bucket);
    const fileRef = bucket.file(path);

    await fileRef.save(file, {
      metadata: {
        contentType: options.metadata?.contentType || "application/octet-stream",
        customMetadata: {
          tenantId: options.tenantId,
          userId: options.userId,
          ...options.metadata,
        },
      },
    });

    const [metadata] = await fileRef.getMetadata();

    return {
      id: path,
      tenantId: options.tenantId,
      filename: path.split("/").pop() || filename,
      originalName: filename,
      mimeType: metadata.contentType || "application/octet-stream",
      size: typeof metadata.size === "number" ? metadata.size : parseInt(metadata.size || "0"),
      url: `https://firebasestorage.googleapis.com/v0/b/${this.bucket}/o/${encodeURIComponent(path)}?alt=media`,
      metadata: options.metadata || {},
      createdAt: new Date(metadata.timeCreated || Date.now()),
      createdBy: options.userId,
    };
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const bucket = adminStorage.bucket(this.bucket);
    await bucket.file(id).delete();
  }

  async getSignedUrl(id: string, tenantId: string, expiresIn = 3600): Promise<string> {
    const bucket = adminStorage.bucket(this.bucket);
    const [url] = await bucket.file(id).getSignedUrl({
      action: "read",
      expires: Date.now() + expiresIn * 1000,
    });
    return url;
  }

  async getMetadata(id: string, tenantId: string): Promise<StorageFile | null> {
    const bucket = adminStorage.bucket(this.bucket);
    const [metadata] = await bucket.file(id).getMetadata();
    
    return {
      id,
      tenantId,
      filename: metadata.name || "",
      originalName: metadata.name || "",
      mimeType: metadata.contentType || "application/octet-stream",
      size: typeof metadata.size === "number" ? metadata.size : parseInt(metadata.size || "0"),
      url: `https://firebasestorage.googleapis.com/v0/b/${this.bucket}/o/${encodeURIComponent(id)}?alt=media`,
      metadata: metadata.metadata || {},
      createdAt: new Date(metadata.timeCreated || Date.now()),
      createdBy: (metadata.metadata as Record<string, string>)?.userId || "",
    };
  }

  async list(tenantId: string, folder?: string): Promise<StorageFile[]> {
    const bucket = adminStorage.bucket(this.bucket);
    const prefix = `tenants/${tenantId}/${folder || "files"}/`;
    
    const [files] = await bucket.getFiles({ prefix });
    return files.map((file: any) => ({
      id: file.name,
      tenantId,
      filename: file.name.split("/").pop() || "",
      originalName: file.name.split("/").pop() || "",
      mimeType: file.contentType || "application/octet-stream",
      size: typeof file.size === "number" ? file.size : parseInt(file.size || "0"),
      url: `https://firebasestorage.googleapis.com/v0/b/${this.bucket}/o/${encodeURIComponent(file.name)}?alt=media`,
      metadata: file.metadata || {},
      createdAt: new Date(file.timeCreated || Date.now()),
      createdBy: (file.metadata as Record<string, string>)?.userId || "",
    }));
  }
}
