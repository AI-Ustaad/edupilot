import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register a robust font for international support (Urdu/English)
// For now, we use the default Helvetica, but you can register Roboto or Noto Nastaliq here later.
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf'
});

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 11, fontFamily: 'Helvetica', color: '#1E293B' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#1E293B', paddingBottom: 10, marginBottom: 20 },
  schoolName: { fontSize: 22, fontWeight: 'bold', color: '#0F172A' },
  reportTitle: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', color: '#64748B', letterSpacing: 2 },
  
  studentInfo: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#F8FAFC', padding: 10, borderRadius: 4 },
  infoCol: { flex: 1 },
  infoLabel: { fontSize: 9, color: '#64748B', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 2 },
  infoValue: { fontSize: 12, fontWeight: 'bold', color: '#0F172A' },

  tableHeader: { flexDirection: 'row', backgroundColor: '#0F172A', color: '#FFFFFF', padding: 8, fontWeight: 'bold', fontSize: 10, textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', padding: 8, fontSize: 10 },
  colSubject: { flex: 3 },
  colMarks: { flex: 1, textAlign: 'center' },
  colGrade: { flex: 1, textAlign: 'center', fontWeight: 'bold' },

  footer: { position: 'absolute', bottom: 30, left: 30, right: 30, flexDirection: 'row', justifyContent: 'space-between', marginTop: 50 },
  signatureLine: { borderTopWidth: 1, borderTopColor: '#0F172A', width: 150, marginTop: 40, paddingTop: 5, textAlign: 'center', fontSize: 9, fontWeight: 'bold' },
  
  aiSection: { marginTop: 20, padding: 10, backgroundColor: '#EFF6FF', borderLeftWidth: 3, borderLeftColor: '#3B82F6', borderRadius: 2 },
  aiTitle: { fontSize: 10, fontWeight: 'bold', color: '#1D4ED8', marginBottom: 5, textTransform: 'uppercase' },
  aiText: { fontSize: 10, color: '#334155', lineHeight: 1.5 },
});

interface ReportData {
  schoolName: string;
  term: string;
  student: { name: string; fatherName: string; classGrade: string; section: string; rollNumber: string };
  marks: { subject: string; totalMarks: number; marksObtained: number; grade: string }[];
  aiComment?: string;
}

export const ReportCardTemplate: React.FC<{ data: ReportData }> = ({ data }) => {
  const totalMax = data.marks.reduce((sum, m) => sum + m.totalMarks, 0);
  const totalObt = data.marks.reduce((sum, m) => sum + m.marksObtained, 0);
  const percentage = totalMax > 0 ? ((totalObt / totalMax) * 100).toFixed(1) : '0.0';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.schoolName}>{data.schoolName || 'EduPilot Academy'}</Text>
          <Text style={styles.reportTitle}>{data.term} Report</Text>
        </View>

        {/* Student Info */}
        <View style={styles.studentInfo}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Student Name</Text>
            <Text style={styles.infoValue}>{data.student.name}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Father's Name</Text>
            <Text style={styles.infoValue}>{data.student.fatherName}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Class & Section</Text>
            <Text style={styles.infoValue}>{data.student.classGrade} - {data.student.section}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Roll No</Text>
            <Text style={styles.infoValue}>{data.student.rollNumber}</Text>
          </View>
        </View>

        {/* Marks Table Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.colSubject}>Subject</Text>
          <Text style={styles.colMarks}>Total</Text>
          <Text style={styles.colMarks}>Obtained</Text>
          <Text style={styles.colMarks}>%</Text>
          <Text style={styles.colGrade}>Grade</Text>
        </View>

        {/* Marks Table Rows */}
        {data.marks.map((m, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={styles.colSubject}>{m.subject}</Text>
            <Text style={styles.colMarks}>{m.totalMarks}</Text>
            <Text style={styles.colMarks}>{m.marksObtained}</Text>
            <Text style={styles.colMarks}>{((m.marksObtained / m.totalMarks) * 100).toFixed(0)}%</Text>
            <Text style={styles.colGrade}>{m.grade}</Text>
          </View>
        ))}

        {/* Grand Total Row */}
        <View style={[styles.tableRow, { backgroundColor: '#F1F5F9', fontWeight: 'bold' }]}>
          <Text style={[styles.colSubject, { fontWeight: 'bold' }]}>GRAND TOTAL</Text>
          <Text style={styles.colMarks}>{totalMax}</Text>
          <Text style={styles.colMarks}>{totalObt}</Text>
          <Text style={styles.colMarks}>{percentage}%</Text>
          <Text style={styles.colGrade}>-</Text>
        </View>

        {/* AI Comment Section */}
        {data.aiComment && (
          <View style={styles.aiSection}>
            <Text style={styles.aiTitle}>Teacher's AI Comment</Text>
            <Text style={styles.aiText}>{data.aiComment}</Text>
          </View>
        )}

        {/* Signatures */}
        <View style={styles.footer}>
          <View style={styles.signatureLine}>
            <Text>Class Teacher</Text>
          </View>
          <View style={styles.signatureLine}>
            <Text>Principal</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
