// services/ai/chatbot.service.ts
export class ChatbotService {
  async respond(question: string): Promise<string> {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // یا آپ کا موجودہ ماڈل
          messages: [
            { role: "system", content: "You are EduPilot AI, a helpful school management assistant. Answer concisely." },
            { role: "user", content: question }
          ],
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        throw new Error(`AI API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error: any) {
      console.error("Chatbot Service Error:", error);
      throw new Error("AI Service is currently unavailable.");
    }
  }
}
