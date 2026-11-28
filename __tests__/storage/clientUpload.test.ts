// __tests__/storage/clientUpload.test.ts
// B12 rework (27 Nov audit): the video upload went through the serverless
// function as multipart, so a 4.6 MB file hit Vercel's 4.5 MB request-body
// cap (413) and the platform's structured error body crashed the app via
// the toast. The bytes must now go straight from the browser to Firebase
// Storage with the client SDK. These tests pin that path: the helper must
// upload to videos/<tenantId>/... with the file's content type and return
// the download URL — and a storage failure must reject with a real Error
// carrying a string message (never a raw object for a toast to choke on).
//
// B12 ROUND 2 (28 Nov live verification): the round-1 fix stopped the
// crash, but the upload HUNG on "Uploading..." — no toast, no error, no
// video. The round-1 code awaited the UploadTask with no bound, and the
// task's promise only settles on a network-driven state transition, so a
// stalled request (or a 5xx retry loop with backoff up to 10 min) left the
// mutation pending forever. These tests pin the round-2 guarantee: the
// helper settles the task explicitly through its state_changed observer,
// races each Storage phase against a 120s timeout (cancelling the task on
// timeout), and maps Storage errors — above all storage/unauthorized,
// which names the Firebase Storage rule that must be fixed — to clear
// string messages. A hang with no feedback must never happen again.
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

type TaskCallbacks = {
  error?: (err: unknown) => void;
  complete?: () => void;
};

function makeFakeTask() {
  const callbacks: TaskCallbacks = {};
  const cancel = jest.fn();
  const on = jest.fn(
    (
      _event: string,
      _next: null,
      errorCb: (err: unknown) => void,
      completeCb: () => void
    ) => {
      callbacks.error = errorCb;
      callbacks.complete = completeCb;
      return jest.fn(); // unsubscribe
    }
  );
  return { task: { on, cancel }, callbacks };
}

describe("uploadVideoToStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRef.mockImplementation((_storage: unknown, path: string) => ({ path }));
    mockGetUrl.mockResolvedValue(
      "https://firebasestorage.googleapis.com/v0/b/edupilot-d262f.appspot.com/o/videos%2Ftenant1%2F123_test.mp4?alt=media&token=tok"
    );
  });

  function mockTaskCompleting() {
    const { task, callbacks } = makeFakeTask();
    mockUpload.mockImplementation(() => {
      // Complete on the next tick, like a real finished upload.
      queueMicrotask(() => callbacks.complete?.());
      return task;
    });
    return { task, callbacks };
  }

  it("uploads the file to videos/<tenantId>/ and returns the download URL", async () => {
    mockTaskCompleting();
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
    mockTaskCompleting();
    const file = new File(["x"], "my lecture (final) #2.mp4", { type: "video/mp4" });
    await uploadVideoToStorage(file, "tenant1");
    const path = (mockRef.mock.calls[0] as any[])[1] as string;
    expect(path).toMatch(/^videos\/tenant1\/\d+_my_lecture__final___2\.mp4$/);
  });

  it("rejects with a clear Storage-rules message when storage refuses the write", async () => {
    const { task, callbacks } = makeFakeTask();
    mockUpload.mockImplementation(() => {
      queueMicrotask(() =>
        callbacks.error?.({
          code: "storage/unauthorized",
          message: "User does not have permission to access 'videos/tenant1/123_test.mp4'.",
        })
      );
      return task;
    });
    const file = new File(["x"], "test.mp4", { type: "video/mp4" });
    await expect(uploadVideoToStorage(file, "tenant1")).rejects.toThrow(
      /storage\/unauthorized.*Storage rules/i
    );
    await expect(uploadVideoToStorage(file, "tenant1")).rejects.toThrow(Error);
  });

  it("rejects with the Storage error message for other failures", async () => {
    const { task, callbacks } = makeFakeTask();
    mockUpload.mockImplementation(() => {
      queueMicrotask(() => callbacks.error?.(new Error("storage/unknown: Something broke.")));
      return task;
    });
    const file = new File(["x"], "test.mp4", { type: "video/mp4" });
    await expect(uploadVideoToStorage(file, "tenant1")).rejects.toThrow(
      "storage/unknown: Something broke."
    );
  });

  it("fails honestly instead of hanging when the upload never settles", async () => {
    // Round-2 regression: the task's observer callbacks are never invoked
    // (stalled request / endless retry loop). The helper must reject with
    // a timeout error and cancel the task — never leave the caller pending.
    const { task } = makeFakeTask();
    mockUpload.mockReturnValue(task);
    const file = new File(["x"], "test.mp4", { type: "video/mp4" });
    await expect(uploadVideoToStorage(file, "tenant1", { timeoutMs: 50 })).rejects.toThrow(
      /timed out after 0 seconds|timed out/i
    );
    expect(task.cancel).toHaveBeenCalled();
  });

  it("fails honestly instead of hanging when the download-URL lookup never settles", async () => {
    mockTaskCompleting();
    mockGetUrl.mockImplementation(() => new Promise(() => {})); // never resolves
    const file = new File(["x"], "test.mp4", { type: "video/mp4" });
    await expect(uploadVideoToStorage(file, "tenant1", { timeoutMs: 50 })).rejects.toThrow(
      /download link timed out/i
    );
  });
});
