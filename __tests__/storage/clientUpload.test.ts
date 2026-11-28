// __tests__/storage/clientUpload.test.ts
// B12 rework (27 Nov audit): the video upload went through the serverless
// function as multipart, so a 4.6 MB file hit Vercel's 4.5 MB request-body
// cap (413) and the platform's structured error body crashed the app via
// the toast. The bytes must now go straight from the browser to Firebase
// Storage with the client SDK. These tests pin that path: the helper must
// upload to videos/<tenantId>/... with the file's content type and return
// the download URL — and a storage failure must reject with a real Error
// carrying a string message (never a raw object for a toast to choke on).
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { uploadVideoToStorage } from "@/lib/storage/clientUpload";

jest.mock("firebase/storage", () => ({
  ref: jest.fn(),
  uploadBytesResumable: jest.fn(),
  getDownloadURL: jest.fn(),
}));

jest.mock("@/lib/firebase", () => ({
  storage: { __mockStorage: true },
}));

const mockRef = ref as jest.Mock;
const mockUpload = uploadBytesResumable as jest.Mock;
const mockGetUrl = getDownloadURL as jest.Mock;

describe("uploadVideoToStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRef.mockImplementation((_storage: unknown, path: string) => ({ path }));
    mockUpload.mockResolvedValue(undefined);
    mockGetUrl.mockResolvedValue(
      "https://firebasestorage.googleapis.com/v0/b/edupilot-d262f.appspot.com/o/videos%2Ftenant1%2F123_test.mp4?alt=media&token=tok"
    );
  });

  it("uploads the file to videos/<tenantId>/ and returns the download URL", async () => {
    const file = new File(["fake-video-bytes"], "test lecture.mp4", { type: "video/mp4" });
    const url = await uploadVideoToStorage(file, "tenant1");

    expect(mockRef).toHaveBeenCalledWith(
      expect.objectContaining({ __mockStorage: true }),
      expect.stringMatching(/^videos\/tenant1\/\d+_test_lecture\.mp4$/)
    );
    expect(mockUpload).toHaveBeenCalledWith(
      expect.objectContaining({ path: expect.stringContaining("videos/tenant1/") }),
      file,
      { contentType: "video/mp4" }
    );
    expect(mockGetUrl).toHaveBeenCalled();
    expect(url).toContain("firebasestorage.googleapis.com");
  });

  it("sanitizes unsafe characters out of the file name", async () => {
    const file = new File(["x"], "my lecture (final) #2.mp4", { type: "video/mp4" });
    await uploadVideoToStorage(file, "tenant1");
    const path = (mockRef.mock.calls[0] as any[])[1] as string;
    expect(path).toMatch(/^videos\/tenant1\/\d+_my_lecture__final___2\.mp4$/);
  });

  it("rejects with an Error carrying a string message when storage fails", async () => {
    mockUpload.mockRejectedValue(new Error("storage/unauthorized: User is not authorized."));
    const file = new File(["x"], "test.mp4", { type: "video/mp4" });
    await expect(uploadVideoToStorage(file, "tenant1")).rejects.toThrow(
      "storage/unauthorized: User is not authorized."
    );
    await expect(uploadVideoToStorage(file, "tenant1")).rejects.toThrow(Error);
  });
});
