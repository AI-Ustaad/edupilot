import { generateContent } from "@/lib/ai/gemini";

export class ChatbotService {
  async respond(question: string, context?: string): Promise<string> {
    const prompt = `You are an educational assistant. Answer the following question helpfully and concisely: ${question}`;
    const text = await generateContent({ prompt, temperature: 0.5, maxOutputTokens: 500 });
    return text;
  }
}
