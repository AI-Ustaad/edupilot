// services/ai/agent.service.ts

const PRINCIPAL_PROMPT = `You are the Principal Agent for EduPilot, an advanced AI School Management System.
Your job is to analyze school data (students, attendance, fees, academic performance) and provide:
1. A brief executive summary of the school's current health.
2. Key risks (e.g., low attendance, fee defaults, failing students).
3. Actionable recommendations for the principal.
Always be professional, concise, and data-driven. Format your response in clear markdown with bullet points.`;

export class AgentService {
  
  // Helper function to call Google Gemini API directly
  private async callAI(systemPrompt: string, userContent: string) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
      
      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [
            {
              role: "user",
              parts: [{ text: userContent }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`AI API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
      
    } catch (error: any) {
      console.error("AI Service Error:", error);
      throw new Error("AI Agent failed to generate response.");
    }
  }

  // Principal Agent
  async principalAgent(schoolData: any) {
    const userContent = `Here is the current school data:\n${JSON.stringify(schoolData, null, 2)}\n\nPlease provide the executive summary, risks, and recommendations.`;
    return this.callAI(PRINCIPAL_PROMPT, userContent);
  }

  // Teacher Agent
  async teacherAgent(topic: string, classGrade: string, subject: string) {
    const systemPrompt = "You are an expert educational content creator. Generate detailed lesson plans and quizzes in a structured format.";
    const userContent = `Create a lesson plan and a 5-question MCQ quiz for Class ${classGrade}, Subject: ${subject}, Topic: ${topic}.`;
    return this.callAI(systemPrompt, userContent);
  }
}
