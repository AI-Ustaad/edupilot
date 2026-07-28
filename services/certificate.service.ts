// services/certificate.service.ts
import { StudentRepository } from "@/repositories/student.repository";
import type { IStudentRepository } from "@/interfaces/IStudentRepository";
import jsPDF from "jspdf";

export class CertificateService {
  private studentRepo: IStudentRepository;

  constructor(studentRepo?: IStudentRepository) {
    this.studentRepo = studentRepo ?? new StudentRepository();
  }

  async generateCertificate(tenantId: string, studentId: string, type: "degree" | "transfer" = "degree"): Promise<Buffer> {
    const studentData = await this.studentRepo.findById(studentId, tenantId);
    if (!studentData) {
      throw new Error("Student not found");
    }

    const student = studentData as any;
    const doc = new jsPDF();
    doc.setFont("helvetica");
    doc.setFontSize(22);
    doc.text(type === "degree" ? "DEGREE CERTIFICATE" : "TRANSFER CERTIFICATE", 105, 40, { align: "center" });
    doc.setFontSize(12);
    doc.text(`This is to certify that ${student?.fullName}, son/daughter of ${student?.fatherName},`, 20, 80);
    doc.text(`has successfully completed Class ${student?.classGrade} with Roll No. ${student?.rollNumber}.`, 20, 90);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 120);
    doc.text("Principal's Signature", 150, 150);

    return Buffer.from(doc.output("arraybuffer"));
  }
}
