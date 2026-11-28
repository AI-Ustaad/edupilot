// lib/storage/clientUpload.ts
// B12 rework (27 Nov audit): uploading a 4.6 MB video through the
// serverless function crashed the whole app.
//
// Why the function path cannot work for real videos: Vercel caps a
// serverless function's request body at 4.5 MB (413
// FUNCTION_PAYLOAD_TOO_LARGE) and the route has no maxDuration, so a
// multi-MB upload can also be killed mid-flight (504
// FUNCTION_INVOCATION_TIMEOUT). Either platform error answers with a JSON
// body whose `error` field is an OBJECT, which the old toast code passed
// straight to showToast() — React threw "Objects are not valid as a React
// child" and the app landed on the "Critical System Error" page.
//
// The fix for the upload itself: send the bytes straight from the browser
// to Firebase Storage with the Firebase client SDK (resumable upload, no
// function body, no function timeout). The serverless function then only
// receives the small metadata JSON + the download URL, which the existing
// POST /video-lectures JSON branch already accepts. Failures here throw a
// real Error with a string message, which extractErrorMessage() turns into
// an honest error toast — never a crash, never a fake success.
//
// B12 ROUND 2 (28 Nov live verification): the round-1 fix stopped the
// crash, but the upload itself HUNG on "Uploading..." twice — no toast,
// no error, no video. Diagnosed cause: the round-1 code awaited the
// UploadTask with NO bound of any kind. The task's promise only settles
// when the SDK's state machine transitions, and every transition is
// driven by a network response — while the SDK's requests (resumable
// session initiation, chunk upload, auth-token refresh) carry NO timeout,
// and on 5xx/408/429 the SDK retries with exponential backoff for up to
// its maxUploadRetryTime (10 minutes). A stalled request — or a retry
// loop that outlasts the user's patience — leaves the mutation pending
// forever and the button spinning. (Probed 28 Nov: a POST to the exact
// resumable-upload endpoint stalled 15s+ once, then answered in 0.5s on
// retry — stalls on this path are real. The metadata POST cannot be the
// hang: axios gives it a 120s timeout.)
//
// So this helper now BOUNDS the whole Storage phase: the upload and the
// download-URL lookup each race a 120s timer (same bound as the metadata
// POST). On timeout the task is cancelled and a clear Error is thrown, so
// the mutation settles, the button un-sticks, and the user gets an honest
// toast naming the cause. A hang with no feedback is never acceptable.
// B12 ROUND 3 (28 Nov live verification): the round-2 fix bounded the
// upload, but the 12:05 verification STILL saw a silent hang — spinner
// over 2 minutes, NO toast, then idle, library empty, reproduced twice.
// The timer logic itself is sound (verified against the Firebase SDK
// source: setTimeout + reject is unconditional, and task.cancel() returns
// a boolean, never throws). The 13-minute gap between the round-2 merge
// (11:52) and the verification (12:05), plus the fact that this page is
// statically prerendered (its HTML can keep pointing at the old bundle's
// chunks), makes a stale bundle the most likely explanation — the
// verification ran the round-1 code, which has no timer at all. But a
// stale deploy must not be an excuse, and the failure exposed a real
// product gap: the ONLY failure signal was a toast that auto-dismisses
// after 5 seconds. If it is missed (or the page is reloaded, killing the
// in-flight mutation), the user sees a spinner stop with NO explanation
// and NO persistent record of what happened — exactly the observed
// symptom. So round 3 makes failure impossible to miss:
//   - the form now shows the error INLINE, persistently, until the next
//     retry (in addition to the toast);
//   - the upload reports live progress (bytes transferred), so a stall is
//     visible as a stuck percentage instead of a bare spinner;
//   - the timeout can never be silenced by the cancellation itself
//     (onTimeout is wrapped so the rejection always fires);
//   - both video pages are force-dynamic, so the browser can never be
//     served a stale statically-prerendered page pointing at an old
//     bundle (see the page files).
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import type { UploadTaskSnapshot } from "firebase/storage";
import { storage } from "@/lib/firebase";

/** Bound for each Storage phase (upload, then download-URL lookup). Same
 *  120s as the metadata POST in useUploadVideo, so the whole upload
 *  settles — success or honest failure — in bounded time. */
export const VIDEO_UPLOAD_TIMEOUT_MS = 120_000;

function timeoutMessage(timeoutMs: number): string {
  const seconds = Math.round(timeoutMs / 1000);
  return (
    `Video upload timed out after ${seconds} seconds — the upload made no progress. ` +
    `Check your connection and try again. If this keeps happening, the Firebase Storage ` +
    `rules may be blocking the upload (see below).`
  );
}

/** Map a Firebase Storage failure to a plain Error with a string message
 *  the UI can show. storage/unauthorized is the one the user can act on:
 *  the Storage rules (Firebase console — no storage.rules file exists in
 *  this repo) must allow the signed-in user to write to
 *  videos/{tenantId}/... . A rules denial answers 403 and fails FAST; it
 *  is not the hang — but without this message the user would never know
 *  the rule is the problem. */
export function toStorageError(error: unknown, objectPath: string): Error {
  const code = (error as { code?: unknown } | null | undefined)?.code;
  const message = error instanceof Error ? error.message : "";
  if (code === "storage/unauthorized") {
    return new Error(
      `Upload refused by Firebase Storage (storage/unauthorized). The Storage rules ` +
        `do not allow this account to write to ${objectPath}. Ask the project owner to ` +
        `allow signed-in users to write to videos/{tenantId}/... in the Firebase console ` +
        `(Authentication -> Storage -> Rules).`
    );
  }
  if (code === "storage/retry-limit-exceeded") {
    return new Error(
      `Video upload timed out — Storage kept failing and gave up. Check your connection and try again.`
    );
  }
  if (code === "storage/canceled") {
    return new Error(`Video upload was cancelled.`);
  }
  return message
    ? new Error(message)
    : new Error(`Video upload to storage failed. Please check your connection and try again.`);
}

/** Race a promise against a timer. On timeout, run onTimeout (e.g. cancel
 *  the upload task) and reject with a timeout Error. The loser of the race
 *  is consumed by Promise.race, so a late rejection is never unhandled. */
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  onTimeout: () => void,
  message: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => {
      // B12 ROUND 3: the rejection must ALWAYS fire. If onTimeout itself
      // threw (e.g. a future SDK change makes task.cancel() throw), the
      // reject below would never run and the caller would hang forever —
      // the exact symptom round 2 was supposed to kill. cancel() cannot
      // throw today (verified in the installed SDK source), but the
      // timeout must not depend on that.
      try {
        onTimeout();
      } catch {
        // Cancellation failing must never swallow the timeout itself.
      }
      reject(new Error(message));
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer !== undefined) clearTimeout(timer);
  });
}

/**
 * Upload a video file straight from the browser to Firebase Storage and
 * return its download URL. The returned promise ALWAYS settles within
 * ~VIDEO_UPLOAD_TIMEOUT_MS per phase: success, an honest Storage error,
 * or a timeout error — never a silent hang.
 */
export async function uploadVideoToStorage(
  file: File,
  tenantId: string,
  opts?: {
    timeoutMs?: number;
    /** Called with live progress while the upload runs, so the UI can show
     *  a percentage instead of a bare spinner — a stalled upload is then
     *  visible as a stuck percentage, not a silent hang. */
    onProgress?: (bytesTransferred: number, totalBytes: number) => void;
  }
): Promise<string> {
  const timeoutMs = opts?.timeoutMs ?? VIDEO_UPLOAD_TIMEOUT_MS;
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const objectPath = `videos/${tenantId}/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, objectPath);
  const task = uploadBytesResumable(storageRef, file, {
    contentType: file.type || "video/mp4",
  });
  // Settle explicitly through the task's state_changed observer instead of
  // `await task`: the observer callbacks are the SDK's only settlement
  // path, and wiring them here makes the promise settle exactly once —
  // success, error, or (via the timeout race) cancellation. The `next`
  // callback reports live progress (B12 round 3).
  const uploadPromise = new Promise<void>((resolve, reject) => {
    const unsubscribe = task.on(
      "state_changed",
      (snapshot: UploadTaskSnapshot) => {
        opts?.onProgress?.(snapshot.bytesTransferred, snapshot.totalBytes);
      },
      (err) => {
        unsubscribe();
        reject(toStorageError(err, objectPath));
      },
      () => {
        unsubscribe();
        resolve();
      }
    );
  });
  await withTimeout(uploadPromise, timeoutMs, () => task.cancel(), timeoutMessage(timeoutMs));
  return withTimeout(
    getDownloadURL(storageRef),
    timeoutMs,
    () => {},
    `Video upload finished but getting its download link timed out after ${Math.round(
      timeoutMs / 1000
    )} seconds. Check your connection and try again.`
  );
}
