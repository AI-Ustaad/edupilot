import { readFileSync } from "fs";
import { join } from "path";

// B26: the Leave page heading said "Pending Leave Requests" while the list
// shows APPROVED and REJECTED requests too (GET /leave returns every status
// and each row renders its status badge). The heading — and the empty state
// — must describe the full list, not just the pending slice. The sidebar
// already calls this page "Leave Requests", so the heading matches the nav.
describe("B26 — Leave Requests page heading", () => {
  const pageSource = readFileSync(
    join(process.cwd(), "app/(protected)/leave-requests/page.tsx"),
    "utf-8"
  );

  it("headings the page 'Leave Requests', not 'Pending Leave Requests'", () => {
    expect(pageSource).toContain(">Leave Requests</h1>");
    expect(pageSource).not.toContain("Pending Leave Requests");
  });

  it("empty state does not claim there are no pending requests", () => {
    expect(pageSource).not.toContain("No pending leave requests");
    expect(pageSource).toContain("No leave requests.");
  });

  it("the list still renders every request with its status badge", () => {
    // The heading rename is only correct because the list is unfiltered and
    // each row shows its status; if the list is ever filtered to pending
    // only, this test must be revisited along with the heading.
    expect(pageSource).toContain('leave.status === "approved"');
    expect(pageSource).toContain('leave.status === "rejected"');
    expect(pageSource).toContain('leave.status === "pending"');
  });
});
