// services/chat.service.ts
import { ChatRepository } from "@/repositories/chat.repository";
import type { IChatRepository } from "@/interfaces/IChatRepository";
import type { ChatMessage, ChatFilter } from "@/repositories/chat.repository";

export class ChatService {
  private repository: IChatRepository;

  constructor(repository?: IChatRepository) {
    this.repository = repository ?? new ChatRepository();
  }

  async findByTenant(
    tenantId: string,
    filterOrTeacherId?: string | ChatFilter,
    parentId?: string
  ): Promise<ChatMessage[]> {
    return this.repository.findByTenant(tenantId, filterOrTeacherId, parentId);
  }

  async createMessage(data: Partial<ChatMessage> & { tenantId: string; text?: string; message?: string }): Promise<string> {
    return this.repository.createMessage(data);
  }
}
