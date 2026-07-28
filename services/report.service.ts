import jsPDF from "jspdf";
import "jspdf-autotable";
import { AttendanceService } from "./attendance.service";
import { AttendanceRepository } from "@/repositories/attendance.repository";
import { StudentRepository } from "@/repositories/student.repository";
import { MarksRepository } from "@/repositories/marks.repository";
import { ReportCardTemplate } from "@/lib/pdf/ReportCardTemplate";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import type { IReportService } from "@/interfaces/IReportService";

export class ReportService implements IReportService {
  private attendanceService = new AttendanceService(new AttendanceRepository());

  async generateAttendanceReport(tenantId: string, month: string): Promise<Buffer> {
    const records = await this.attendanceService.listAttendance(tenantId, { date: month });
    const doc = new jsPDF();
    doc.text(`Attendance Report - ${month}`, 14, 20);
    (doc as any).autoTable({
      head: [["Student", "Class", "Date", "Status"]],
      body: records.map(r => [r.studentName, r.classGrade, r.date, r.status]),
    });
    return Buffer.from(doc.output("arraybuffer"));
  }

  async generateAttendanceCSV(tenantId: string, month: string): Promise<string> {
    const records = await this.attendanceService.listAttendance(tenantId, { date: month });
    let csv = "Student,Class,Date,Status\n";
    records.forEach(r => {
      csv += `"${r.studentName}","${r.classGrade}","${r.date}","${r.status}"\n`;
    });
    return csv;
  }

  async generateReportCard(tenantId: string, studentId: string, term: string): Promise<Buffer> {
    const studentRepo = new StudentRepository();
    const marksRepo = new MarksRepository();

    const student = await studentRepo.findById(studentId, tenantId);
    if (!student) {
      throw new Error("Student not found");
    }

    const marks = await marksRepo.findWithFilters(tenantId, { studentId, term });

    const pdfData = {
      schoolName: "EduPilot Academy",
      term,
      student: {
        name: student.fullName || student.name || "Unknown",
        fatherName: student.fatherName || "N/A",
        classGrade: student.classGrade || "N/A",
        section: student.section || "N/A",
        rollNumber: student.rollNumber || "N/A",
      },
      marks: marks.map(m => ({
        subject: m.subject || "Unknown Subject",
        totalMarks: Number(m.totalMarks) || 0,
        marksObtained: Number(m.marksObtained) || 0,
        grade: m.grade || "-",
      })),
      aiComment: "An excellent term! Keep up the hard work and maintain focus on continuous improvement."
    };

    const buffer = await renderToBuffer(React.createElement(ReportCardTemplate, { data: pdfData }) as any);
    return Buffer.from(buffer);
  }
}
