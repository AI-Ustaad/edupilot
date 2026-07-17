// lib/ai/strategies/StaffStrategy.ts
import { DocumentStrategy } from "@/interfaces/IAIGateway";
import { DocumentType } from "@/types/ocr";
import { staffPrompt } from "@/lib/ai/prompts/staff.prompt";

export class StaffStrategy implements DocumentStrategy {
  public readonly type: DocumentType = "staff";

  buildPrompt(): string {
    return staffPrompt;
  }

  buildSystemInstruction(): string {
    return "You are a strict HR data extraction system. Extract fields from HR documents accurately. Never make up data. If a field is not clearly visible, leave it as an empty string.";
  }

  validateResponse(data: any): boolean {
    if (!data || typeof data !== "object") return false;
    // At minimum, we expect some fields
    const hasData = Object.values(data).some((v) => v && String(v).trim().length > 0);
    return hasData;
  }

  calculateConfidence(data: any): number {
    const fields = [
      "fullName",
      "fatherName",
      "cnic",
      "dob",
      "designation",
      "personnelNo",
      "basicSalary",
      "grossPay",
      "bankName",
      "accountNumber",
    ];

    const filledFields = fields.filter((field) => data[field] && String(data[field]).trim().length > 0);
    const ratio = filledFields.length / fields.length;

    // Higher confidence if key fields (fullName) are present
    const hasKeyFields = !!(data.fullName && data.fullName.trim().length > 0);

    if (!hasKeyFields) return Math.min(ratio * 0.5, 0.3);
    return Math.min(0.3 + ratio * 0.7, 1.0);
  }

  normalize(data: any): any {
    return {
      fullName: String(data.fullName || "").trim(),
      fatherName: String(data.fatherName || "").trim(),
      cnic: String(data.cnic || "").trim(),
      dob: String(data.dob || "").trim(),
      designation: String(data.designation || "").trim(),
      personnelNo: String(data.personnelNo || "").trim(),
      basicSalary: String(data.basicSalary || "").trim(),
      grossPay: String(data.grossPay || "").trim(),
      netPay: String(data.netPay || "").trim(),
      accountNumber: String(data.accountNumber || "").trim(),
      bankName: String(data.bankName || "").trim(),
    };
  }

  extractJson(text: string): any {
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No JSON found in response");
    }

    return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
  }
}
