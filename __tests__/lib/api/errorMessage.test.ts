// __tests__/lib/api/errorMessage.test.ts
// B12 rework (27 Nov audit): the video upload crashed the whole app because
// the toast message was taken straight from err?.response?.data?.error —
// and Vercel platform errors carry that field as an OBJECT
// ({"error": {"code": "413", "message": "..."}}). React threw rendering the
// object as a toast child and the app landed on the "Critical System Error"
// page. extractErrorMessage() must ALWAYS return a string, for every error
// shape, so no toast can ever crash the app again.
import { extractErrorMessage } from "@/lib/api/errorMessage";

describe("extractErrorMessage", () => {
  it("returns a plain string error unchanged", () => {
    expect(extractErrorMessage("Video upload to storage failed.")).toBe(
      "Video upload to storage failed."
    );
  });

  it("returns an Error instance's message", () => {
    expect(extractErrorMessage(new Error("Network Error"))).toBe("Network Error");
  });

  it("unwraps a Vercel 413 platform error object to its message string", () => {
    const vercel413 = {
      response: {
        status: 413,
        data: {
          error: {
            code: "FUNCTION_PAYLOAD_TOO_LARGE",
            message: "The payload sent to a function exceeds the maximum allowed size.",
          },
        },
      },
    };
    const msg = extractErrorMessage(vercel413, "Failed to upload video lecture.");
    expect(typeof msg).toBe("string");
    expect(msg).toBe("The payload sent to a function exceeds the maximum allowed size.");
  });

  it("unwraps a Vercel 504 timeout platform error object to its message string", () => {
    const vercel504 = {
      response: {
        status: 504,
        data: {
          error: {
            code: "FUNCTION_INVOCATION_TIMEOUT",
            message: "The function invocation timed out.",
          },
        },
      },
    };
    const msg = extractErrorMessage(vercel504, "Failed to upload video lecture.");
    expect(typeof msg).toBe("string");
    expect(msg).toBe("The function invocation timed out.");
  });

  it("handles a platform error object without a response wrapper", () => {
    const msg = extractErrorMessage(
      { error: { code: "FUNCTION_PAYLOAD_TOO_LARGE", message: "Payload Too Large" } },
      "Failed."
    );
    expect(msg).toBe("Payload Too Large");
  });

  it("falls back to the error code when a platform error object has no message", () => {
    const msg = extractErrorMessage(
      { response: { data: { error: { code: "FUNCTION_THROTTLED" } } } },
      "Failed."
    );
    expect(msg).toBe("FUNCTION_THROTTLED");
  });

  it("prefers the app's own string error/message fields", () => {
    expect(
      extractErrorMessage({ response: { data: { error: "Title is required" } } }, "Failed.")
    ).toBe("Title is required");
    expect(
      extractErrorMessage(
        { response: { data: { message: "Video upload to storage failed." } } },
        "Failed."
      )
    ).toBe("Video upload to storage failed.");
  });

  it("returns the fallback for undefined, null and empty values", () => {
    expect(extractErrorMessage(undefined, "Failed to upload video lecture.")).toBe(
      "Failed to upload video lecture."
    );
    expect(extractErrorMessage(null, "Failed to upload video lecture.")).toBe(
      "Failed to upload video lecture."
    );
    expect(extractErrorMessage("", "Failed to upload video lecture.")).toBe(
      "Failed to upload video lecture."
    );
  });

  it("never returns an object, even for an unknown object shape", () => {
    const msg = extractErrorMessage({ response: { data: { weird: { a: 1 } } } }, "Failed.");
    expect(typeof msg).toBe("string");
    expect(msg.length).toBeGreaterThan(0);
  });
});
