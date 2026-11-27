import { StorageRepository } from "@/repositories/storage.repository";
import { UploadService } from "@/services/upload.service";
import { adminStorage } from "@/lib/firebase-admin";

jest.mock("@/lib/firebase-admin", () => ({
  adminStorage: {
    bucket: jest.fn(),
  },
}));

jest.mock("@/lib/logger/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe("Storage Security - StorageRepository & UploadService", () => {
  let mockFile: any;
  let mockBucket: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockFile = {
      name: "tenant_123/test.pdf",
      save: jest.fn().mockResolvedValue(undefined),
      makePublic: jest.fn().mockResolvedValue(undefined),
      setMetadata: jest.fn().mockResolvedValue(undefined),
      getSignedUrl: jest.fn().mockResolvedValue(["https://storage.googleapis.com/signed-url-for-private-file"]),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    mockBucket = {
      name: "edupilot-d262f.appspot.com",
      file: jest.fn().mockReturnValue(mockFile),
    };

    (adminStorage.bucket as jest.Mock).mockReturnValue(mockBucket);
  });

  describe("StorageRepository.uploadFile", () => {
    it("generates a signed URL for private files by default (makePublic = false)", async () => {
      const repo = new StorageRepository();
      const buffer = Buffer.from("test-content");

      const url = await repo.uploadFile(buffer, "test.pdf", "application/pdf", "tenant_123");

      expect(mockFile.save).toHaveBeenCalledWith(buffer, { contentType: "application/pdf" });
      expect(mockFile.makePublic).not.toHaveBeenCalled();
      expect(mockFile.getSignedUrl).toHaveBeenCalledWith(
        expect.objectContaining({ action: "read" })
      );
      expect(url).toBe("https://storage.googleapis.com/signed-url-for-private-file");
    });

    it("throws a controlled error and NEVER returns a plain storage URL when signed URL fails", async () => {
      mockFile.getSignedUrl.mockRejectedValue(new Error("GCP signing key unavailable"));
      const repo = new StorageRepository();
      const buffer = Buffer.from("test-content");

      await expect(
        repo.uploadFile(buffer, "test.pdf", "application/pdf", "tenant_123", false)
      ).rejects.toThrow("Failed to generate secure signed URL for private file: GCP signing key unavailable");

      expect(mockFile.makePublic).not.toHaveBeenCalled();
    });

    it("explicitly makes file public only when makePublic is true", async () => {
      const repo = new StorageRepository();
      const buffer = Buffer.from("test-content");

      const url = await repo.uploadFile(buffer, "logo.png", "image/png", "public", true);

      expect(mockFile.save).toHaveBeenCalledWith(buffer, { contentType: "image/png" });
      expect(mockFile.makePublic).toHaveBeenCalled();
      expect(mockFile.getSignedUrl).not.toHaveBeenCalled();
      expect(url).toBe("https://storage.googleapis.com/edupilot-d262f.appspot.com/tenant_123/test.pdf");
    });

    // B12: uniform bucket-level access (the Firebase default) rejects
    // object ACLs, so makePublic() fails on such buckets even though the
    // object was stored. The upload must still return a URL that serves
    // the stored object — a Firebase download-token URL — instead of
    // throwing and leaving the caller to fabricate a dead link.
    it("falls back to a Firebase download-token URL when makePublic fails (B12)", async () => {
      mockFile.makePublic.mockRejectedValue(new Error("Uniform bucket-level access enabled"));
      const repo = new StorageRepository();
      const buffer = Buffer.from("test-content");

      const url = await repo.uploadFile(buffer, "lecture.mp4", "video/mp4", "videos/tenant_123", true);

      expect(mockFile.save).toHaveBeenCalledWith(buffer, { contentType: "video/mp4" });
      expect(mockFile.makePublic).toHaveBeenCalled();
      expect(mockFile.setMetadata).toHaveBeenCalledWith({
        metadata: { firebaseStorageDownloadTokens: expect.any(String) },
      });
      expect(url).toMatch(
        /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/edupilot-d262f\.appspot\.com\/o\/.+\?alt=media&token=[0-9a-f-]+$/
      );
    });

    it("throws a controlled error when both makePublic and the token fallback fail", async () => {
      mockFile.makePublic.mockRejectedValue(new Error("Uniform bucket-level access enabled"));
      mockFile.setMetadata.mockRejectedValue(new Error("metadata write denied"));
      const repo = new StorageRepository();
      const buffer = Buffer.from("test-content");

      await expect(
        repo.uploadFile(buffer, "logo.png", "image/png", "public", true)
      ).rejects.toThrow("Failed to make file public: Uniform bucket-level access enabled");
    });
  });

  describe("UploadService delegation", () => {
    it("delegates to storage repo and defaults makePublic to false", async () => {
      const service = new UploadService();
      const buffer = Buffer.from("test-content");

      const url = await service.uploadFile(buffer, "test.pdf", "application/pdf", "tenant_123");

      expect(mockFile.makePublic).not.toHaveBeenCalled();
      expect(mockFile.getSignedUrl).toHaveBeenCalled();
      expect(url).toBe("https://storage.googleapis.com/signed-url-for-private-file");
    });
  });
});
