// services/ai/agent.service.ts
import apiClient from "@/lib/api/client"; // Using our Enterprise Axios Client

// 🤖 Principal Agent System Prompt
const PRINCIPAL_PROMPT = `You are the Principal Agent for EduPilot, an advanced AI School Management System.
Your job is to analyze school data (students, attendance, fees, academic performance) and provide:
1. A brief executive summary of the school's current health.
2. Key risks (e.g., low attendance, fee defaults, failing students).
3. Actionable recommendations for the principal.
Always be professional, concise, and data-driven. Format your response in clear markdown with bullet points.`;

export class AgentService {
  
  // Helper function to call OpenAI API directly via Fetch/Axios
  private async callAI(systemPrompt: string, userContent: string) {
    try {
      // Using standard fetch to call OpenAI API (or any compatible endpoint)
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // یا آپ کا موجودہ ماڈل
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent }
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
      console.error("AI Service Error:", error);
      throw new Error("AI Agent failed to generate response.");
    }
  }

  // Principal Agent: ڈیٹا کا تجزیہ کر کے رپورٹ دے گا
  async principalAgent(schoolData: any) {
    const userContent = `Here is the current school data:\n${JSON.stringify(schoolData, null, 2)}\n\nPlease provide the executive summary, risks, and recommendations.`;
    return this.callAI(PRINCIPAL_PROMPT, userContent);
  }

  // Teacher Agent: Lesson Plans اور Quizzes بنائے گا
  async teacherAgent(topic: string, classGrade: string, subject: string) {
    const systemPrompt = "You are an expert educational content creator. Generate detailed lesson plans and quizzes in JSON format.";
    const userContent = `Create a lesson plan and a 5-question MCQ quiz for Class ${classGrade}, Subject: ${subject}, Topic: ${topic}.`;
    return this.callAI(systemPrompt, userContent);
  }
}
