// lib/storage/storage.ts
export interface StorageFile {
  id: string;
  tenantId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  createdBy: string;
}

export interface StorageOptions {
  tenantId: string;
  userId: string;
  folder?: string;
  metadata?: Record<string, any>;
}

export interface IStorageProvider {
  upload(file: Buffer, filename: string, options: StorageOptions): Promise<StorageFile>;
  delete(id: string, tenantId: string): Promise<void>;
  getSignedUrl(id: string, tenantId: string, expiresIn?: number): Promise<string>;
  getMetadata(id: string, tenantId: string): Promise<StorageFile | null>;
  list(tenantId: string, folder?: string): Promise<StorageFile[]>;
}

export class StorageService {
  private provider: IStorageProvider;
  private static instance: StorageService;

  private constructor(provider: IStorageProvider) {
    this.provider = provider;
  }

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService({
        upload: async () => ({ id: "", tenantId: "", filename: "", originalName: "", mimeType: "", size: 0, url: "", metadata: {}, createdAt: new Date(), createdBy: "" }),
        delete: async () => {},
        getSignedUrl: async () => "",
        getMetadata: async () => null,
        list: async () => [],
      } as IStorageProvider);
    }
    return StorageService.instance;
  }

  async upload(file: Buffer, filename: string, options: StorageOptions): Promise<StorageFile> {
    return this.provider.upload(file, filename, options);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    return this.provider.delete(id, tenantId);
  }

  async getSignedUrl(id: string, tenantId: string, expiresIn = 3600): Promise<string> {
    return this.provider.getSignedUrl(id, tenantId, expiresIn);
  }

  async getMetadata(id: string, tenantId: string): Promise<StorageFile | null> {
    return this.provider.getMetadata(id, tenantId);
  }

  async list(tenantId: string, folder?: string): Promise<StorageFile[]> {
    return this.provider.list(tenantId, folder);
  }
}

export const storageService = StorageService.getInstance();
