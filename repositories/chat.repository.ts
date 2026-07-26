// repositories/chat.repository.ts
import { adminDb } from "@/lib/firebase-admin";

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

export class ChatRepository {
  private getCollection() {
    return adminDb.collection("chat_messages");
  }

  async findByTenant(tenantId: string, teacherId?: string, parentId?: string, limitCount: number = 100): Promise<ChatMessage[]> {
    let query = this.getCollection().where("tenantId", "==", tenantId);
    
    if (teacherId) {
      query = query.where("teacherId", "==", teacherId);
    }
    if (parentId) {
      query = query.where("parentId", "==", parentId);
    }
    
    query = query.orderBy("createdAt", "asc").limit(limitCount);

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as ChatMessage));
  }

  async createMessage(data: Omit<ChatMessage, "id" | "createdAt">): Promise<string> {
    const docRef = await this.getCollection().add({
      ...data,
      createdAt: new Date(),
    });
    return docRef.id;
  }
}
