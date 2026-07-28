import { BaseRepository } from "./base.repository";
import { IChatRepository } from "@/interfaces/IChatRepository";

export interface ChatMessage {
  id?: string;
  teacherId: string;
  parentId: string;
  text: string;
  senderRole: string;
  senderUid: string;
  tenantId: string;
  createdAt?: any;
}

export class ChatRepository extends BaseRepository<ChatMessage> implements IChatRepository {
  constructor() {
    super("chat_messages");
  }

  async findByTenant(tenantId: string, teacherId?: string, parentId?: string, limitCount = 100): Promise<ChatMessage[]> {
    let query = this.db.collection(this.collectionName).where("tenantId", "==", tenantId);
    
    if (teacherId) query = query.where("teacherId", "==", teacherId);
    if (parentId) query = query.where("parentId", "==", parentId);
    
    query = query.orderBy("createdAt", "asc").limit(limitCount);

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as ChatMessage));
  }

  async createMessage(data: Omit<ChatMessage, "id" | "createdAt">): Promise<string> {
    const docRef = await this.db.collection(this.collectionName).add({
      ...data,
      createdAt: new Date(),
    });
    return docRef.id;
  }
}
