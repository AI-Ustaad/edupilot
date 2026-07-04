// services/ai/agent.service.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🤖 Principal Agent System Prompt
const PRINCIPAL_PROMPT = `You are the Principal Agent for EduPilot, an advanced AI School Management System.
Your job is to analyze school data (students, attendance, fees, academic performance) and provide:
1. A brief executive summary of the school's current health.
2. Key risks (e.g., low attendance, fee defaults, failing students).
3. Actionable recommendations for the principal.
Always be professional, concise, and data-driven. Format your response in clear markdown with bullet points.`;

export class AgentService {
  // Principal Agent: ڈیٹا کا تجزیہ کر کے رپورٹ دے گا
  async principalAgent(schoolData: any) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // یا آپ کا موجودہ ماڈل
        messages: [
          { role: "system", content: PRINCIPAL_PROMPT },
          { 
            role: "user", 
            content: `Here is the current school data:\n${JSON.stringify(schoolData, null, 2)}\n\nPlease provide the executive summary, risks, and recommendations.`
          }
        ],
        temperature: 0.7,
      });

      return response.choices[0].message.content;
    } catch (error: any) {
      console.error("Principal Agent Error:", error);
      throw new Error("AI Agent failed to generate insights.");
    }
  }

  // Teacher Agent: Lesson Plans اور Quizzes بنائے گا
  async teacherAgent(topic: string, classGrade: string, subject: string) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: "You are an expert educational content creator. Generate detailed lesson plans and quizzes in JSON format." 
          },
          { 
            role: "user", 
            content: `Create a lesson plan and a 5-question MCQ quiz for Class ${classGrade}, Subject: ${subject}, Topic: ${topic}.` 
          }
        ],
        temperature: 0.7,
      });

      return response.choices[0].message.content;
    } catch (error: any) {
      console.error("Teacher Agent Error:", error);
      throw new Error("AI Agent failed to generate lesson plan.");
    }
  }
}
