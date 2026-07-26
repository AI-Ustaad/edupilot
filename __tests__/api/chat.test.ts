import { GET } from "@/app/api/v1/chat/route";
import { ChatRepository } from "@/repositories/chat.repository";
import { getSessionUser } from "@/lib/auth/auth-server";

jest.mock("@/lib/auth/auth-server");
jest.mock("@/repositories/chat.repository");

describe("Chat API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET returns 401 if no session", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue(null);
    const req = new Request("http://localhost/api/v1/chat");
    const res = await GET(req as any, {});
    expect(res.status).toBe(401);
  });

  it("GET returns messages for tenant", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: "user123",
      tenantId: "tenant123",
      role: "teacher",
    });

    const mockMessages = [
      { id: "1", teacherId: "t1", parentId: "p1", text: "Hello", tenantId: "tenant123" },
    ];
    (ChatRepository.prototype.findByTenant as jest.Mock).mockResolvedValue(mockMessages);

    const req = new Request("http://localhost/api/v1/chat?teacherId=t1&parentId=p1");
    const res = await GET(req as any, { tenantId: "tenant123" });
    
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual(mockMessages);
  });
});
