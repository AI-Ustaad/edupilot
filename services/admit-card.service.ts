// services/admit-card.service.ts
import { StudentRepository } from "@/repositories/student.repository";
import type { IStudentRepository } from "@/interfaces/IStudentRepository";
import jsPDF from "jspdf";

export class AdmitCardService {
  private studentRepo: IStudentRepository;

  constructor(studentRepo?: IStudentRepository) {
    this.studentRepo = studentRepo ?? new StudentRepository();
  }

  async generateBulkAdmitCards(tenantId: string, classGrade: string, section: string, examTerm: string, schoolName: string): Promise<Buffer> {
    const students = await this.studentRepo.findBySection(classGrade, section, tenantId);

    if (students.length === 0) {
      throw new Error("No students found");
    }

    const doc = new jsPDF();
    let y = 20;

    for (let i = 0; i < students.length; i++) {
      const s = students[i];
      if (i > 0) { doc.addPage(); y = 20; }

      doc.setFontSize(18).setFont("helvetica", "bold");
      doc.text(schoolName || "EduPilot Academy", 105, y, { align: "center" });
      y += 10;
      doc.setFontSize(12).setFont("helvetica", "normal");
      doc.text("Admit Card", 105, y, { align: "center" });
      y += 15;
      doc.setFontSize(11);
      doc.text(`Student: ${s.fullName || "N/A"}`, 20, y); y += 8;
      doc.text(`Father: ${s.fatherName || "N/A"}`, 20, y); y += 8;
      doc.text(`Class: ${s.classGrade} - ${s.section} | Roll: ${s.rollNumber}`, 20, y); y += 12;
      doc.setFont("helvetica", "bold");
      doc.text(`Exam: ${examTerm}`, 20, y); y += 10;
      doc.setFont("helvetica", "normal");
      doc.text("Principal's Signature", 120, y + 15);
      doc.text("_________________________", 20, y + 15);
    }

    return Buffer.from(doc.output("arraybuffer"));
  }
}
