// lib/workers/report.worker.tsx

import { JobService } from "@/lib/services/job.service";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";
import { adminDb } from "@/lib/firebase-admin";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReportCardTemplate } from "@/lib/pdf/ReportCardTemplate";
import React from "react";
import { getStorage } from "firebase-admin/storage"; // ☁️ Firebase Storage Import

export async function runReportWorker(data: any) {
  const { tenantId, jobId, studentIds, term } = data;
  const total = studentIds.length;

  console.log(`👷‍♂️ [Worker] Starting report generation for Job: ${jobId}`);
  
  try {
    // جاب کا اسٹیٹس 'processing' کر دیں
    await JobService.updateProgress(tenantId, jobId, 0, total, "processing");

    // School Branding ایک ہی بار فیچ کریں
    const settingsSnap = await adminDb.collection("settings").doc(tenantId).get();
    const schoolName = settingsSnap.exists ? settingsSnap.data()?.schoolName || "EduPilot Academy" : "EduPilot Academy";

    // لوپ چلا کر ایک ایک سٹوڈنٹ کی رپورٹ بنائیں
    for (let i = 0; i < total; i++) {
      const studentId = studentIds[i];

      // 1. سٹوڈنٹ کا ڈیٹا لائیں
      const studentSnap = await adminDb.collection("students").doc(studentId).get();
      if (!studentSnap.exists) continue;
      const student = studentSnap.data();

      // 2. سٹوڈنٹ کے نمبرز لائیں
      const marksSnap = await adminDb.collection("marks")
        .where("tenantId", "==", tenantId)
        .where("studentId", "==", studentId)
        .where("term", "==", term)
        .get();

      const marks = marksSnap.docs.map(d => ({
        subject: d.data().subject || "Unknown Subject",
        totalMarks: Number(d.data().totalMarks) || 0,
        marksObtained: Number(d.data().marksObtained) || 0,
        grade: d.data().grade || "-",
      }));

      // 3. PDF کا ڈیٹا تیار کریں
      const pdfData = {
        schoolName,
        term,
        student: {
          name: student?.fullName || student?.name || "Unknown",
          fatherName: student?.fatherName || "N/A",
          classGrade: student?.classGrade || "N/A",
          section: student?.section || "N/A",
          rollNumber: student?.rollNumber || "N/A",
        },
        marks,
        aiComment: "Generated automatically via EduPilot Enterprise Worker."
      };

      // 4. PDF Buffer بنائیں
      const buffer = await renderToBuffer(<ReportCardTemplate data={pdfData} />);
      const pdfBytes = new Uint8Array(buffer);

      // ☁️ 5. FIREBASE STORAGE INTEGRATION (Enterprise Upload)
      const bucket = getStorage().bucket(); 
      const filePath = `tenants/${tenantId}/reports/${term}/${studentId}.pdf`;
      const file = bucket.file(filePath);

      // بفر کو کلاؤڈ پر محفوظ کریں (Save to Cloud)
      await file.save(Buffer.from(pdfBytes), {
        metadata: { contentType: "application/pdf" },
      });

      // ایک سیکیور ڈاؤن لوڈ لنک (Signed URL) بنائیں جو کچھ سالوں تک کارآمد ہو
      const [downloadUrl] = await file.getSignedUrl({
        action: "read",
        expires: "01-01-2030", 
      });

      // 📝 6. ڈیٹا بیس میں سٹوڈنٹ کی رپورٹ کا ریکارڈ محفوظ کریں
      await adminDb.collection("tenants").doc(tenantId).collection("generated_reports").add({
        studentId,
        jobId,
        term,
        fileUrl: downloadUrl,
        createdAt: new Date().toISOString(),
      });
      
      // 7. ہر رپورٹ بننے کے بعد فرنٹ اینڈ کے لیے لائیو پروگریس (Progress) اپڈیٹ کریں
      await JobService.updateProgress(tenantId, jobId, i + 1, total, "processing");
    }
    
    // 100% مکمل!
    await JobService.updateProgress(tenantId, jobId, total, total, "completed");
    console.log(`✅ [Worker] Reports successfully generated for Job: ${jobId}`);
    
    // Event Bus کو بتائیں تاکہ اگر کوئی نوٹیفکیشن بھیجنا ہو تو وہ چلا جائے
    eventBus.publish(EVENTS.REPORT_GENERATED, { tenantId, jobId });

  } catch (error: any) {
    console.error(`❌ [Worker] Failed Job ${jobId}:`, error);
    await JobService.failJob(tenantId, jobId, error.message);
    throw error; 
  }
}
