import { GET, POST } from "@/app/api/v1/chat/route";
import { ChatRepository } from "@/repositories/chat.repository";
import { getSessionUser } from "@/lib/auth/auth-server";

jest.mock("@/lib/auth/auth-server");
jest.mock("@/repositories/chat.repository");

describe("Chat API - Protocol Harmonization and Security", () => {
  const tenantId = "tenant123";
  const teacherId = "teacher_001";
  const parentId = "parent_002";
  const expectedChatId = [teacherId, parentId].sort().join("_");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET returns 401 if no session", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue(null);
    const req = new Request("http://localhost/api/v1/chat");
    const res = await GET(req as any, {});
    expect(res.status).toBe(401);
  });

  it("GET returns messages for tenant with legacy params", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: teacherId,
      tenantId,
      role: "teacher",
    });

    const mockMessages = [
      { id: "1", chatId: expectedChatId, senderId: teacherId, receiverId: parentId, text: "Hello", tenantId },
    ];
    (ChatRepository.prototype.findByTenant as jest.Mock).mockResolvedValue(mockMessages);

    const req = new Request(`http://localhost/api/v1/chat?teacherId=${teacherId}&parentId=${parentId}`);
    const res = await GET(req as any, { tenantId });
    
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual(mockMessages);
  });

  it("GET queries by canonical chatId when provided", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: parentId,
      tenantId,
      role: "parent",
    });

    (ChatRepository.prototype.findByTenant as jest.Mock).mockResolvedValue([]);

    const req = new Request(`http://localhost/api/v1/chat?chatId=${expectedChatId}`);
    const res = await GET(req as any, { tenantId });
    
    expect(res.status).toBe(200);
    expect(ChatRepository.prototype.findByTenant).toHaveBeenCalledWith(
      tenantId,
      { chatId: expectedChatId },
      undefined
    );
  });

  it("POST sends message using canonical model (receiverId + text)", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: teacherId,
      tenantId,
      role: "teacher",
    });

    (ChatRepository.prototype.createMessage as jest.Mock).mockResolvedValue("msg_new_123");

    const req = new Request("http://localhost/api/v1/chat", {
      method: "POST",
      body: JSON.stringify({
        receiverId: parentId,
        text: "Please review the report card.",
      }),
    });

    const res = await POST(req as any, { tenantId, user: { uid: teacherId, tenantId, role: "teacher" } });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.id).toBe("msg_new_123");
    expect(json.data.chatId).toBe(expectedChatId);

    expect(ChatRepository.prototype.createMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        chatId: expectedChatId,
        senderId: teacherId,
        receiverId: parentId,
        senderRole: "teacher",
        tenantId,
        text: "Please review the report card.",
      })
    );
  });

  it("POST supports parent sending message to teacher (role authorization)", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: parentId,
      tenantId,
      role: "parent",
    });

    (ChatRepository.prototype.createMessage as jest.Mock).mockResolvedValue("msg_parent_456");

    const req = new Request("http://localhost/api/v1/chat", {
      method: "POST",
      body: JSON.stringify({
        receiverId: teacherId,
        text: "Thank you, I have reviewed it.",
      }),
    });

    const res = await POST(req as any, { tenantId, user: { uid: parentId, tenantId, role: "parent" } });
    expect(res.status).toBe(201);
  });

  it("POST accepts legacy payload (teacherId + parentId + text)", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: teacherId,
      tenantId,
      role: "teacher",
    });

    (ChatRepository.prototype.createMessage as jest.Mock).mockResolvedValue("msg_legacy_789");

    const req = new Request("http://localhost/api/v1/chat", {
      method: "POST",
      body: JSON.stringify({
        teacherId,
        parentId,
        text: "Legacy client format test",
      }),
    });

    const res = await POST(req as any, { tenantId, user: { uid: teacherId, tenantId, role: "teacher" } });
    expect(res.status).toBe(201);
    expect(ChatRepository.prototype.createMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        chatId: expectedChatId,
        senderId: teacherId,
        receiverId: parentId,
        text: "Legacy client format test",
      })
    );
  });

  it("POST rejects requests missing text or recipient", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: teacherId,
      tenantId,
      role: "teacher",
    });

    // Missing text
    const req1 = new Request("http://localhost/api/v1/chat", {
      method: "POST",
      body: JSON.stringify({ receiverId: parentId }),
    });
    const res1 = await POST(req1 as any, { tenantId, user: { uid: teacherId, tenantId, role: "teacher" } });
    expect(res1.status).toBe(400);

    // Missing receiver
    const req2 = new Request("http://localhost/api/v1/chat", {
      method: "POST",
      body: JSON.stringify({ text: "Hello" }),
    });
    const res2 = await POST(req2 as any, { tenantId, user: { uid: teacherId, tenantId, role: "teacher" } });
    expect(res2.status).toBe(400);
  });
});
