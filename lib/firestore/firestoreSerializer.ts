/**
 * Firestore Serializer — Shared utility for cleaning payloads before Firestore writes.
 *
 * Removes undefined values recursively from objects and arrays.
 * This prevents Firestore errors like:
 *   "Cannot use undefined as a Firestore value"
 *
 * Usage:
 *   import { serializeForFirestore } from "@/lib/firestore/firestoreSerializer";
 *   const clean = serializeForFirestore(dirtyData);
 *   await db.collection("x").add(clean);
 *
 * This is the canonical implementation — all repositories (Staff, Student, Parent,
 * Attendance, Marks, Timetable, etc.) should use this instead of duplicating
 * cleanup logic in individual services.
 */

/**
 * Recursively removes all undefined values from an object or array.
 * - null is preserved (Firestore supports null)
 * - undefined keys are stripped from objects
 * - undefined items are filtered from arrays
 * - Date objects are preserved as-is
 * - Nested objects/arrays are cleaned recursively
 */
export function serializeForFirestore<T = any>(data: T): T {
  if (data === null) return data;
  if (data === undefined) return data;
  if (data instanceof Date) return data;

  if (Array.isArray(data)) {
    return data
      .map((item) => serializeForFirestore(item))
      .filter((item) => item !== undefined) as unknown as T;
  }

  if (typeof data === "object") {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = serializeForFirestore(value);
      }
    }
    return cleaned as T;
  }

  return data;
}
