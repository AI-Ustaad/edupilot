/**
 * lib/utils/reportCardPdf.ts
 *
 * Dedicated A4 Report Card PDF generator for EduPilot.
 * Renders professional, publication-quality academic report cards
 * with exact margins, school branding, subject breakdown, and grade badges.
 */
import jsPDF from "jspdf";
import { formatClassLabel, cleanSectionName } from "@/lib/utils/formatClassLabel";
import { calculateGrade } from "@/lib/utils/grading";

export interface ReportCardSubject {
  subject: string;
  marksObtained: number | string;
  totalMarks: number | string;
  grade?: string;
  percentage?: number | string;
  teacherComment?: string;
}

export interface ReportCardData {
  studentId: string;
  studentName: string;
  rollNumber: string | number;
  classGrade?: string;
  section?: string;
  term?: string;
  marks: ReportCardSubject[];
  totalObtained: number | string;
  totalMax: number | string;
  percentage: number | string;
  grade: string;
}

export interface ReportCardOptions {
  schoolName?: string;
  subtitle?: string;
  term?: string;
  classGrade?: string;
  section?: string;
  doc?: jsPDF;
}

export function buildStudentReportCardDoc(
  data: ReportCardData,
  options?: ReportCardOptions
): jsPDF {
  const doc = options?.doc || new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const schoolName = options?.schoolName || "Government High School Sahiwal";
  const subtitle = options?.subtitle || "Punjab Government (PCTB) • Academic Session 2026-27";
  const term = options?.term || data.term || "Final Exams";
  const cls = formatClassLabel(options?.classGrade || data.classGrade || "Class 10");
  const sec = cleanSectionName(options?.section || data.section || "A");

  // Page dimensions: 210 x 297 mm
  // Draw outer decorative border
  doc.setDrawColor(49, 46, 129); // Indigo 900
  doc.setLineWidth(1.5);
  doc.rect(10, 10, 190, 277);

  // Inner border
  doc.setDrawColor(99, 102, 241); // Indigo 500
  doc.setLineWidth(0.5);
  doc.rect(12, 12, 186, 273);

  // Header Banner
  doc.setFillColor(243, 244, 246); // Gray 100
  doc.rect(13, 13, 184, 32, "F");

  // School Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text(schoolName, 105, 24, { align: "center" });

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(subtitle, 105, 31, { align: "center" });

  // Term Title Ribbon
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(79, 70, 229); // Indigo 600
  doc.text(`ACADEMIC REPORT CARD — ${term.toUpperCase()}`, 105, 40, { align: "center" });

  // Student Info Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(18, 50, 174, 30, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text("Student Name:", 24, 59);
  doc.text("Roll Number:", 24, 67);
  doc.text("Class & Section:", 24, 75);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(data.studentName || "Imran Haider", 60, 59);
  doc.text(String(data.rollNumber ?? "103"), 60, 67);
  doc.text(`${cls} - Section ${sec}`, 60, 75);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text("Result Status:", 120, 59);
  doc.text("Overall Grade:", 120, 67);
  doc.text("Issued On:", 120, 75);

  const pctNum = Number(data.percentage) || 0;
  const isPass = pctNum >= 50 && data.grade !== "F";
  doc.setTextColor(isPass ? 22 : 220, isPass ? 101 : 38, isPass ? 52 : 38);
  doc.text(isPass ? "PASS" : "FAIL", 152, 59);

  doc.setTextColor(79, 70, 229);
  doc.text(data.grade || calculateGrade(data.percentage), 152, 67);

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "normal");
  doc.text(new Date().toLocaleDateString("en-GB"), 152, 75);

  // Subject Marks Table Header
  const tableY = 88;
  doc.setFillColor(79, 70, 229);
  doc.rect(18, tableY, 174, 10, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("Subject", 24, tableY + 6.5);
  doc.text("Marks Obtained", 90, tableY + 6.5, { align: "center" });
  doc.text("Total Marks", 130, tableY + 6.5, { align: "center" });
  doc.text("Grade", 170, tableY + 6.5, { align: "center" });

  // Subject Rows
  let currentY = tableY + 10;
  const marksList = data.marks || [];

  marksList.forEach((m, idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(18, currentY, 174, 9, "F");
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(18, currentY + 9, 192, currentY + 9);

    const markGrade = m.grade || calculateGrade(m.percentage ?? (Number(m.totalMarks) > 0 ? (Number(m.marksObtained) / Number(m.totalMarks)) * 100 : 0));

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(m.subject, 24, currentY + 6);
    doc.text(String(m.marksObtained), 90, currentY + 6, { align: "center" });
    doc.text(String(m.totalMarks), 130, currentY + 6, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229);
    doc.text(markGrade, 170, currentY + 6, { align: "center" });

    currentY += 9;
  });

  // Table Footer: Totals
  doc.setFillColor(238, 242, 255); // Indigo 50
  doc.rect(18, currentY, 174, 12, "F");
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.8);
  doc.line(18, currentY, 192, currentY);
  doc.line(18, currentY + 12, 192, currentY + 12);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 27, 75);
  doc.text("TOTAL / PERCENTAGE", 24, currentY + 8);
  doc.text(String(data.totalObtained), 90, currentY + 8, { align: "center" });
  doc.text(String(data.totalMax), 130, currentY + 8, { align: "center" });
  doc.text(`${data.percentage}% (${data.grade})`, 170, currentY + 8, { align: "center" });

  currentY += 24;

  // Remarks Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.roundedRect(18, currentY, 174, 25, 2, 2, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("TEACHER'S REMARKS", 24, currentY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  const comment = marksList[0]?.teacherComment || "Excellent performance. Demonstrated thorough subject comprehension and consistent academic dedication.";
  doc.text(comment, 24, currentY + 14, { maxWidth: 162 });

  currentY += 45;

  // Signatures
  doc.setDrawColor(148, 163, 184);
  doc.line(24, currentY, 74, currentY);
  doc.line(136, currentY, 186, currentY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("Class Teacher", 49, currentY + 5, { align: "center" });
  doc.text("Principal / Headmaster", 161, currentY + 5, { align: "center" });

  // Official Stamp placeholder
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("Official School Seal & Signature", 161, currentY + 10, { align: "center" });

  return doc;
}

export function downloadStudentReportPDF(
  data: ReportCardData,
  options?: ReportCardOptions
) {
  const doc = buildStudentReportCardDoc(data, options);
  const cleanName = (data.studentName || "Student").replace(/[^a-zA-Z0-9]/g, "_");
  const roll = data.rollNumber ?? "0";
  doc.save(`Report_Card_${cleanName}_Roll_${roll}.pdf`);
}

export function downloadAllStudentsReportPDF(
  allData: ReportCardData[],
  options?: ReportCardOptions
) {
  if (allData.length === 0) return;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  allData.forEach((studentData, index) => {
    if (index > 0) doc.addPage();
    buildStudentReportCardDoc(studentData, { ...options, doc });
  });

  const cls = (options?.classGrade || "Class").replace(/\s+/g, "_");
  const sec = cleanSectionName(options?.section || "A");
  doc.save(`Report_Cards_${cls}_Section_${sec}.pdf`);
}

