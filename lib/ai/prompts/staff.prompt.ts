// lib/ai/prompts/staff.prompt.ts
export const staffPrompt = `Analyze the attached document (salary slip, CNIC, or CV).
Extract the following fields and return them as a single JSON object. Use an empty string "" for any field that is not found.

Fields to extract:
- fullName: Full name of the staff member
- fatherName: Father's name
- cnic: CNIC/National ID number
- dob: Date of birth (YYYY-MM-DD format)
- designation: Job title or designation
- personnelNo: Personnel/Employee ID number
- basicSalary: Basic salary amount
- grossPay: Gross salary amount
- netPay: Net salary after deductions
- accountNumber: Bank account number
- bankName: Bank name

Return ONLY JSON. No markdown. No explanation. No code block. No comments. No notes.`;
