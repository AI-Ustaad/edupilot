import { adminDb } from "@/lib/firebase-admin";

export class JobService {
  /**
   * 1. نیا کام شروع ہونے پر جاب کریٹ کریں (0% Progress)
   */
  static async createJob(tenantId: string, type: string, createdBy: string, totalItems: number = 0) {
    const jobRef = await adminDb
      .collection("tenants")
      .doc(tenantId)
      .collection("jobs")
      .add({
        type,
        status: "pending", 
        progress: 0,
        totalItems,
        processedItems: 0,
        createdBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    return jobRef.id;
  }

  /**
   * 2. ورکر (Worker) کام کے دوران اس فنکشن سے پروگریس اپڈیٹ کرے گا
   */
  static async updateProgress(
    tenantId: string, 
    jobId: string, 
    processedItems: number, 
    totalItems: number, 
    status: "processing" | "completed" | "failed" = "processing"
  ) {
    const progress = Math.round((processedItems / totalItems) * 100);
    
    const updateData: any = {
      processedItems,
      progress,
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === "completed") {
      updateData.finishedAt = new Date().toISOString();
    }

    await adminDb
      .collection("tenants")
      .doc(tenantId)
      .collection("jobs")
      .doc(jobId)
      .update(updateData);
  }

  /**
   * 3. اگر کام کے دوران کوئی ایرر آ جائے تو جاب کو فیل (Fail) مارک کریں
   */
  static async failJob(tenantId: string, jobId: string, errorMessage: string) {
    await adminDb
      .collection("tenants")
      .doc(tenantId)
      .collection("jobs")
      .doc(jobId)
      .update({
        status: "failed",
        error: errorMessage,
        updatedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
      });
  }
}
