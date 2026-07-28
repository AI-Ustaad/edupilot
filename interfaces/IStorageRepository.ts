// interfaces/IStorageRepository.ts
export interface IStorageRepository {
  uploadFile(buffer: Buffer, fileName: string, contentType: string, folder?: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}
