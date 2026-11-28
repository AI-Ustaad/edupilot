// lib/api/optimistic.ts
// N30 — shared helpers for optimistic list updates.
//
// The delete hooks used to write their optimistic update to the BASE key
// (e.g. ["students", tenantId]) with setQueryData, but the pages render
// list queries whose keys carry extra segments (useStudents appends the
// params object -> ["students", tenantId, undefined]; useStaffDirectory
// appends "directory" + the filter string). setQueryData matches EXACTLY,
// so the optimistic removal never touched the visible list: the deleted
// row stayed on screen while the "deleted successfully" toast was already
// showing, and the undo restore wrote to a key nobody reads.
//
// These helpers operate on ALL queries under the base key (prefix match)
// and understand both list shapes the app caches: a plain array, and the
// paginated object { data: [...], total, page, totalPages }. Anything else
// (detail objects, 360 payloads, timelines) is left untouched.

import type { QueryClient, QueryKey } from "@tanstack/react-query";

/** Snapshot of every cached query under a base key, for rollback. */
export type QuerySnapshot = Array<readonly [QueryKey, unknown]>;

/** Remove one record (by `id`) from cached list data, whatever its shape. */
export function removeRecordFromCachedData(old: unknown, id: string): unknown {
  if (Array.isArray(old)) {
    return old.filter((item: any) => item?.id !== id);
  }
  if (
    old &&
    typeof old === "object" &&
    Array.isArray((old as any).data)
  ) {
    return {
      ...(old as any),
      data: (old as any).data.filter((item: any) => item?.id !== id),
    };
  }
  return old;
}

/**
 * Optimistically remove `id` from every cached list under `baseKey`.
 * Returns a snapshot that restores the previous data (rollback / undo).
 */
export async function optimisticallyRemove(
  queryClient: QueryClient,
  baseKey: QueryKey,
  id: string
): Promise<QuerySnapshot> {
  await queryClient.cancelQueries({ queryKey: baseKey });
  const previous = queryClient.getQueriesData({ queryKey: baseKey });
  queryClient.setQueriesData({ queryKey: baseKey }, (old: unknown) =>
    removeRecordFromCachedData(old, id)
  );
  return previous;
}

/** Restore a snapshot taken by optimisticallyRemove (error rollback / undo). */
export function restoreSnapshot(
  queryClient: QueryClient,
  snapshot: QuerySnapshot | undefined
): void {
  snapshot?.forEach(([key, data]) => queryClient.setQueryData(key, data));
}
