/**
 * @jest-environment jsdom
 *
 * N24 — component test for the audit accept criterion: approve a leave for a
 * staff member, then "Mark All Present" — that member is not marked Present.
 * Written with React.createElement (no JSX) because jest testMatch only
 * picks up *.test.ts files.
 */
import * as React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import apiClient from "@/lib/api/client";
import StaffAttendancePage from "@/app/(protected)/staff-attendance/page";

const TODAY = new Date().toISOString().split("T")[0];

const mockStaff = [
  { staffId: "STF-001", fullName: "Iqra Qureshi", designation: "Teacher", department: "General", status: "active", employeeId: "STF-001" },
  { staffId: "STF-004", fullName: "Hamza Nawaz", designation: "Teacher", department: "Science", status: "active", employeeId: "STF-004" },
];

const mockLeaves = [
  // Audit fixture: Iqra's leave for today is APPROVED.
  { teacherId: "STF-001", teacherName: "Iqra Qureshi", status: "approved", startDate: TODAY, endDate: TODAY },
  // Pending leave must NOT exclude Hamza.
  { teacherId: "STF-004", teacherName: "Hamza Nawaz", status: "pending", startDate: TODAY, endDate: TODAY },
];

const mockShowToast = jest.fn();

jest.mock("@/hooks/useStaff", () => ({
  useStaff: () => ({ data: mockStaff, isLoading: false }),
}));
jest.mock("@/components/ToastProvider", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));
jest.mock("@/lib/api/client", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

beforeEach(() => {
  jest.clearAllMocks();
  (apiClient.get as jest.Mock).mockImplementation((url: string) => {
    if (url.startsWith("/attendance/staff")) return Promise.resolve([]);
    if (url === "/leave") return Promise.resolve(mockLeaves);
    return Promise.resolve([]);
  });
  (apiClient.post as jest.Mock).mockResolvedValue({});
});

test("Mark All Present marks approved-leave staff On Leave, never Present", async () => {
  render(React.createElement(StaffAttendancePage));

  expect(await screen.findByText("Iqra Qureshi")).toBeTruthy();
  expect(await screen.findByText("Hamza Nawaz")).toBeTruthy();

  // Wait for the approved leave to load: Iqra's row shows On Leave active.
  const iqraRow = screen.getByText("Iqra Qureshi").closest("tr") as HTMLElement;
  await waitFor(() => {
    expect(within(iqraRow).getByText("On Leave").className).toContain("bg-blue-600");
  });

  fireEvent.click(screen.getByText("Mark All Present"));
  fireEvent.click(screen.getByText("Save Staff Attendance"));

  await waitFor(() => expect(apiClient.post).toHaveBeenCalled());
  const payload = (apiClient.post as jest.Mock).mock.calls[0][1];
  const byId = Object.fromEntries(
    (payload.records as Array<{ staffId: string; status: string }>).map((r) => [r.staffId, r.status])
  );
  expect(byId["STF-001"]).toBe("leave");
  expect(byId["STF-004"]).toBe("present");
  expect(mockShowToast).toHaveBeenCalledWith(
    expect.stringContaining("1 on approved leave"),
    "info"
  );
});

test("with no approved leaves, Mark All Present marks everyone Present", async () => {
  (apiClient.get as jest.Mock).mockImplementation((url: string) => {
    if (url === "/leave") return Promise.resolve([]);
    return Promise.resolve([]);
  });

  render(React.createElement(StaffAttendancePage));
  expect(await screen.findByText("Iqra Qureshi")).toBeTruthy();

  fireEvent.click(screen.getByText("Mark All Present"));
  fireEvent.click(screen.getByText("Save Staff Attendance"));

  await waitFor(() => expect(apiClient.post).toHaveBeenCalled());
  const payload = (apiClient.post as jest.Mock).mock.calls[0][1];
  const byId = Object.fromEntries(
    (payload.records as Array<{ staffId: string; status: string }>).map((r) => [r.staffId, r.status])
  );
  expect(byId["STF-001"]).toBe("present");
  expect(byId["STF-004"]).toBe("present");
});
