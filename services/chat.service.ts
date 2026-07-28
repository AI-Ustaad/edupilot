// services/chat.service.ts
import { ChatRepository } from "@/repositories/chat.repository";
import type { IChatRepository } from "@/interfaces/IChatRepository";
import type { ChatMessage } from "@/repositories/chat.repository";

export class ChatService {
  private repository: IChatRepository;

  constructor(repository?: IChatRepository) {
    this.repository = repository ?? new ChatRepository();
  }

  async findByTenant(tenantId: string, teacherId?: string, parentId?: string): Promise<ChatMessage[]> {
    return this.repository.findByTenant(tenantId, teacherId, parentId);
  }

  async createMessage(data: Omit<ChatMessage, "id" | "createdAt">): Promise<string> {
    return this.repository.createMessage(data);
  }
}
