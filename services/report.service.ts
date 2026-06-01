import jsPDF from "jspdf";
import "jspdf-autotable";
import { AttendanceService } from "./attendance.service";
import { AttendanceRepository } from "@/repositories/attendance.repository";

export class ReportService {
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
}
