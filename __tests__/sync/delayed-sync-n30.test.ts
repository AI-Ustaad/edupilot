/**
 * @jest-environment jsdom
 */
// __tests__/sync/delayed-sync-n30.test.ts
//
// N30 — Delayed sync: Add Student, Add Staff and fee payment took ~30–60s
// and a reload before appearing; a deleted student row stayed visible
// while the success toast was already showing.
//
// Root causes (traced in code + installed TanStack Query v5.101.0):
//  1. The Add Student page posted via bare apiClient.post and router.push
//     with NO invalidation, so the /students list (live client: 60s
//     staleTime, refetchOnWindowFocus false) served cached data until the
//     stale window passed or the user reloaded.
//  2. The delete hooks' optimistic update wrote to the BASE key
//     (["students", tenantId]) with exact-match setQueryData, but the
//     pages render list queries with extra key segments (useStudents
//     appends params; useStaffDirectory appends "directory" + filters),
//     so the optimistic removal never touched the visible list.
// These tests pin the fix: creates invalidate the rendered list keys, and
// deletes remove the row from the exact keys the pages render, instantly.

import * as fs from "fs";
import * as path from "path";
import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QueryKeys } from "@/lib/api/queryKeys";
import {
  removeRecordFromCachedData,
  optimisticallyRemove,
  restoreSnapshot,
} from "@/lib/api/optimistic";
import { useCreateStudent, useDeleteStudent } from "@/hooks/useStudents";
import { useDeleteStaff } from "@/hooks/useStaff";

const showToastMock = jest.fn();

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { tenantId: "tenant-n30", uid: "user-n30", role: "admin" },
  }),
}));

jest.mock("@/lib/api/client", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("@/components/ToastProvider", () => ({
  useToast: () => ({ showToast: showToastMock }),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const apiClient = require("@/lib/api/client").default;

const TENANT = "tenant-n30";
const STUDENTS_LIST_KEY = [...QueryKeys.students(TENANT), undefined];
const STAFF_DIR_KEY = [...QueryKeys.staff(TENANT), "directory", ""];

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 60_000, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
}

function wrapperFor(client: QueryClient) {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children);
}

const studentA = { id: "stu-1", fullName: "Ali Khan", rollNumber: 1 };
const studentB = { id: "stu-2", fullName: "Sara Ahmed", rollNumber: 2 };
const staffA = { id: "stf-1", fullName: "Iqra Qureshi" };
const staffB = { id: "stf-2", fullName: "Hamza Nawaz" };

beforeEach(() => {
  jest.clearAllMocks();
});

describe("N30 — removeRecordFromCachedData (shared list-shape helper)", () => {
  it("removes the record from a plain array list", () => {
    expect(removeRecordFromCachedData([studentA, studentB], "stu-1")).toEqual([
      studentB,
    ]);
  });

  it("removes the record from a paginated { data: [...] } list", () => {
    const page = { data: [staffA, staffB], total: 2, page: 1, totalPages: 1 };
    expect(removeRecordFromCachedData(page, "stf-2")).toEqual({
      data: [staffA],
      total: 2,
      page: 1,
      totalPages: 1,
    });
  });

  it("leaves detail objects and other shapes untouched", () => {
    const detail = { id: "stu-1", fullName: "Ali Khan", marks: { maths: 92 } };
    expect(removeRecordFromCachedData(detail, "stu-1")).toBe(detail);
    expect(removeRecordFromCachedData(undefined, "stu-1")).toBeUndefined();
    expect(removeRecordFromCachedData(null, "stu-1")).toBeNull();
  });

  it("optimisticallyRemove snapshots every list under the base key and restoreSnapshot puts them back", async () => {
    const client = makeClient();
    client.setQueryData(STUDENTS_LIST_KEY, [studentA, studentB]);
    client.setQueryData([...QueryKeys.students(TENANT), "directory", ""], {
      data: [studentA, studentB],
      total: 2,
      page: 1,
      totalPages: 1,
    });

    const snapshot = await optimisticallyRemove(
      client,
      QueryKeys.students(TENANT),
      "stu-1"
    );

    expect(client.getQueryData<any[]>(STUDENTS_LIST_KEY)).toEqual([studentB]);
    expect(
      client.getQueryData<any>([...QueryKeys.students(TENANT), "directory", ""])
        .data
    ).toEqual([studentB]);

    restoreSnapshot(client, snapshot);
    expect(client.getQueryData<any[]>(STUDENTS_LIST_KEY)).toEqual([
      studentA,
      studentB,
    ]);
  });
});

describe("N30 — creating a student invalidates the rendered list", () => {
  it("useCreateStudent marks the exact /students list key invalidated on success", async () => {
    const client = makeClient();
    client.setQueryData(STUDENTS_LIST_KEY, [studentA]);
    client.setQueryData([...QueryKeys.students(TENANT), "directory", ""], {
      data: [studentA],
      total: 1,
      page: 1,
      totalPages: 1,
    });
    (apiClient.post as jest.Mock).mockResolvedValue({ data: { id: "stu-3" } });

    const { result } = renderHook(() => useCreateStudent(), {
      wrapper: wrapperFor(client),
    });

    await act(async () => {
      await result.current.mutateAsync({ fullName: "New Student" });
    });

    expect(
      client.getQueryState(STUDENTS_LIST_KEY)?.isInvalidated
    ).toBe(true);
    expect(
      client.getQueryState([...QueryKeys.students(TENANT), "directory", ""])
        ?.isInvalidated
    ).toBe(true);
  });
});

describe("N30 — deleting a student removes the row from the rendered list at once", () => {
  it("optimistic update drops the row from the exact list key before the DELETE resolves", async () => {
    const client = makeClient();
    client.setQueryData(STUDENTS_LIST_KEY, [studentA, studentB]);

    let resolveDelete!: (value: unknown) => void;
    const deletePromise = new Promise((resolve) => {
      resolveDelete = resolve;
    });
    (apiClient.delete as jest.Mock).mockReturnValue(deletePromise);

    const { result } = renderHook(() => useDeleteStudent(), {
      wrapper: wrapperFor(client),
    });

    act(() => {
      result.current.mutate("stu-1");
    });

    // Row must vanish from the key the /students page renders, while the
    // server request is still in flight — no waiting for the refetch.
    await waitFor(() => {
      const data = client.getQueryData<any[]>(STUDENTS_LIST_KEY);
      expect(data?.map((s: any) => s.id)).toEqual(["stu-2"]);
    });

    await act(async () => {
      resolveDelete({ data: { success: true } });
      await deletePromise;
    });

    // Still gone after the mutation settles (no resurrection).
    expect(client.getQueryData<any[]>(STUDENTS_LIST_KEY)).toEqual([studentB]);
    expect(showToastMock).toHaveBeenCalledWith(
      "Student deleted successfully.",
      "undo",
      expect.any(Function)
    );
  });

  it("a failed delete restores the row (rollback)", async () => {
    const client = makeClient();
    client.setQueryData(STUDENTS_LIST_KEY, [studentA, studentB]);
    (apiClient.delete as jest.Mock).mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useDeleteStudent(), {
      wrapper: wrapperFor(client),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync("stu-1")
      ).rejects.toThrow("boom");
    });

    expect(client.getQueryData<any[]>(STUDENTS_LIST_KEY)).toEqual([
      studentA,
      studentB,
    ]);
    expect(showToastMock).toHaveBeenCalledWith(
      "Failed to delete student.",
      "error"
    );
  });
});

describe("N30 — deleting a staff member removes the row from the directory list at once", () => {
  it("optimistic update drops the row from the paginated directory key before the DELETE resolves", async () => {
    const client = makeClient();
    client.setQueryData(STAFF_DIR_KEY, {
      data: [staffA, staffB],
      total: 2,
      page: 1,
      totalPages: 1,
    });
    client.setQueryData(QueryKeys.staff(TENANT), [staffA, staffB]);

    let resolveDelete!: (value: unknown) => void;
    const deletePromise = new Promise((resolve) => {
      resolveDelete = resolve;
    });
    (apiClient.delete as jest.Mock).mockReturnValue(deletePromise);

    const { result } = renderHook(() => useDeleteStaff(), {
      wrapper: wrapperFor(client),
    });

    act(() => {
      result.current.mutate("stf-1");
    });

    await waitFor(() => {
      const page = client.getQueryData<any>(STAFF_DIR_KEY);
      expect(page?.data.map((s: any) => s.id)).toEqual(["stf-2"]);
    });
    // The plain staff list is updated too.
    expect(
      client.getQueryData<any[]>(QueryKeys.staff(TENANT))?.map((s: any) => s.id)
    ).toEqual(["stf-2"]);

    await act(async () => {
      resolveDelete({ data: { success: true } });
      await deletePromise;
    });

    expect(
      client.getQueryData<any>(STAFF_DIR_KEY)?.data.map((s: any) => s.id)
    ).toEqual(["stf-2"]);
  });
});

describe("N30 — Add Student page must create through the invalidating hook", () => {
  it("the page uses useCreateStudent and has no bare apiClient.post create", () => {
    const pagePath = path.join(
      process.cwd(),
      "app/(protected)/students/add/page.tsx"
    );
    const src = fs.readFileSync(pagePath, "utf8");
    // The page must route the create through the hook whose onSuccess
    // invalidates the students list — a bare post leaves the list stale
    // for the whole 60s staleTime (the audit's Add Student symptom).
    expect(src).toContain("useCreateStudent");
    expect(src).toContain("createStudent.mutateAsync");
    expect(src).not.toContain('apiClient.post("/students"');
  });
});
