import { BaseRepository } from "./base.repository";
import { IChatRepository } from "@/interfaces/IChatRepository";

export interface ChatMessage {
  id?: string;
  chatId?: string;
  senderId?: string;
  receiverId?: string;
  teacherId?: string;
  parentId?: string;
  text: string;
  message?: string;
  senderRole?: string;
  senderUid?: string;
  tenantId: string;
  createdAt?: any;
}

export interface ChatFilter {
  chatId?: string;
  teacherId?: string;
  parentId?: string;
}

export class ChatRepository extends BaseRepository<ChatMessage> implements IChatRepository {
  constructor() {
    super("chat_messages");
  }

  async findByTenant(
    tenantId: string,
    teacherIdOrFilter?: string | ChatFilter,
    parentId?: string,
    limitCount = 100
  ): Promise<ChatMessage[]> {
    let query: any = this.db.collection(this.collectionName).where("tenantId", "==", tenantId);
    
    if (typeof teacherIdOrFilter === "object" && teacherIdOrFilter !== null) {
      if (teacherIdOrFilter.chatId) {
        query = query.where("chatId", "==", teacherIdOrFilter.chatId);
      } else {
        if (teacherIdOrFilter.teacherId) query = query.where("teacherId", "==", teacherIdOrFilter.teacherId);
        if (teacherIdOrFilter.parentId) query = query.where("parentId", "==", teacherIdOrFilter.parentId);
      }
    } else {
      if (teacherIdOrFilter) query = query.where("teacherId", "==", teacherIdOrFilter);
      if (parentId) query = query.where("parentId", "==", parentId);
    }
    
    query = query.orderBy("createdAt", "asc").limit(limitCount);

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as ChatMessage));
  }

  async createMessage(data: Partial<ChatMessage> & { tenantId: string; text?: string; message?: string }): Promise<string> {
    const text = (data.text || data.message || "").trim();
    const senderId = data.senderId || data.senderUid || "";
    const receiverId = data.receiverId || data.parentId || data.teacherId || "";
    const chatId = data.chatId || (senderId && receiverId ? [senderId, receiverId].sort().join("_") : "");

    const docData: Record<string, any> = {
      chatId,
      senderId,
      senderUid: senderId,
      receiverId,
      senderRole: data.senderRole || "",
      tenantId: data.tenantId,
      text,
      createdAt: new Date(),
    };

    if (data.teacherId) docData.teacherId = data.teacherId;
    if (data.parentId) docData.parentId = data.parentId;

    const docRef = await this.db.collection(this.collectionName).add(docData);
    return docRef.id;
  }
}
