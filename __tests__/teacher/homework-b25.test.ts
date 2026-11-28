/**
 * @jest-environment jsdom
 *
 * B25 — Cross-reset (Homework only): filling Title/Description then
 * selecting Class must NOT clear the already-entered values, and the
 * saved homework must keep them.
 *
 * Reproduction of the 26 Nov audit finding: on /teacher/homework, fill
 * Title + Description, then select a Class — the audit observed both
 * fields cleared. Lesson Plans / Exams (single-object form state) no
 * longer reproduce it.
 *
 * Written with React.createElement (no JSX) because jest testMatch only
 * picks up *.test.ts / *.spec.ts files.
 */
import * as React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

jest.mock("@/context/AuthContext", () => ({
  __esModule: true,
  useAuth: () => ({
    user: {
      uid: "test-admin",
      email: "sindhu.sgd143@gmail.com",
      role: "admin",
      tenantId: "test-tenant",
    },
    loading: false,
    refreshUser: jest.fn(async () => null),
    setUser: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

jest.mock("@/lib/api/client", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    put: jest.fn(),
  },
}));

import apiClient from "@/lib/api/client";
import { ToastProvider } from "@/components/ToastProvider";
import TeacherHomeworkPage from "@/app/(protected)/teacher/homework/page";

const mockedGet = apiClient.get as unknown as jest.Mock;
const mockedPost = apiClient.post as unknown as jest.Mock;

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(
        ToastProvider,
        null,
        React.createElement(TeacherHomeworkPage, null)
      )
    )
  );
}

describe("B25 — Homework cross-reset", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGet.mockImplementation((url: string) => {
      if (url === "/classes") {
        return Promise.resolve([
          { classGrade: "Class 1", sectionName: "A" },
          { classGrade: "Class 1", sectionName: "B" },
          { classGrade: "Class 2", sectionName: "A" },
        ]);
      }
      if (url === "/settings") {
        return Promise.resolve({ subjects: ["English", "Mathematics"] });
      }
      if (url === "/homework") {
        return Promise.resolve([]);
      }
      return Promise.resolve(null);
    });
    mockedPost.mockResolvedValue({});
  });

  it("keeps Title and Description filled after selecting a Class", async () => {
    const user = userEvent.setup();
    const { container } = renderPage();
    const classSelect = container.querySelectorAll("select")[0] as HTMLSelectElement;

    // Wait for the class options to load (classes query resolved).
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "Class 1" })).toBeInTheDocument()
    );

    const titleInput = screen.getByPlaceholderText("Title") as HTMLInputElement;
    const descriptionInput = screen.getByPlaceholderText(
      "Description"
    ) as HTMLTextAreaElement;

    await user.type(titleInput, "TEST — B25 Homework");
    await user.type(descriptionInput, "B25 cross-reset check");
    expect(titleInput.value).toBe("TEST — B25 Homework");
    expect(descriptionInput.value).toBe("B25 cross-reset check");

    // The audit reproduce step: select a Class after filling Title/Description.
    await user.selectOptions(classSelect, "Class 1");

    expect(titleInput.value).toBe("TEST — B25 Homework");
    expect(descriptionInput.value).toBe("B25 cross-reset check");
  });

  it("saves the homework with the entered Title and Description after a Class change", async () => {
    const user = userEvent.setup();
    const { container } = renderPage();
    const classSelect = container.querySelectorAll("select")[0] as HTMLSelectElement;
    const sectionSelect = container.querySelectorAll("select")[1] as HTMLSelectElement;

    await waitFor(() =>
      expect(screen.getByRole("option", { name: "Class 1" })).toBeInTheDocument()
    );

    const titleInput = screen.getByPlaceholderText("Title") as HTMLInputElement;
    const subjectInput = screen.getByPlaceholderText(
      "Subject"
    ) as HTMLInputElement;
    const descriptionInput = screen.getByPlaceholderText(
      "Description"
    ) as HTMLTextAreaElement;

    await user.type(titleInput, "TEST — B25 Homework");
    await user.type(subjectInput, "English");
    await user.type(descriptionInput, "B25 cross-reset check");
    await user.selectOptions(classSelect, "Class 1");

    // Section options reload for the chosen class; pick one so the form is valid.
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: "A" })
      ).toBeInTheDocument()
    );
    await user.selectOptions(sectionSelect, "A");

    await user.click(screen.getByRole("button", { name: /Post Homework/i }));

    await waitFor(() =>
      expect(mockedPost).toHaveBeenCalledWith(
        "/homework",
        expect.objectContaining({
          title: "TEST — B25 Homework",
          description: "B25 cross-reset check",
          classGrade: "Class 1",
          section: "A",
          subject: "English",
        })
      )
    );
  });
});
