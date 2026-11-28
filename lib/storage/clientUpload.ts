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
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export async function uploadVideoToStorage(file: File, tenantId: string): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const objectPath = `videos/${tenantId}/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, objectPath);
  const task = uploadBytesResumable(storageRef, file, {
    contentType: file.type || "video/mp4",
  });
  await task;
  return getDownloadURL(storageRef);
}
