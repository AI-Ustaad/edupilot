import { generateContent } from "@/lib/ai/gemini";

interface BookCenterRequest {
  query: string;         // e.g., "books for grade 5 about science"
  grade?: string;
  type: "recommendation" | "summary" | "qa";
}

export class BookCenterService {
  async process(req: BookCenterRequest): Promise<string> {
    let prompt = "";

    if (req.type === "recommendation") {
      prompt = `Recommend 5 educational books for grade ${req.grade || "5"} related to "${req.query}". For each book, provide title and a one-line description. Return as a plain numbered list.`;
    } else if (req.type === "summary") {
      prompt = `Summarize the key concepts of "${req.query}" in a way suitable for grade ${req.grade || "5"} students. Keep it under 150 words.`;
    } else if (req.type === "qa") {
      prompt = `Answer the following question from a student in grade ${req.grade || "5"}: "${req.query}". Explain in a simple, engaging manner.`;
    }

    const text = await generateContent({ prompt, temperature: 0.7, maxOutputTokens: 500 });
    return text.trim();
  }
}
