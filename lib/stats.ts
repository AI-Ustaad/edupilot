// lib/stats.ts
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// یہ فنکشن Vercel API کے اندر ہی کلاؤڈ فنکشن والا کام کرے گا
export async function updateTenantStats(
  tenantId: string, 
  type: 'students' | 'staff' | 'revenue', 
  amount: number
) {
  try {
    const statsRef = adminDb.collection("tenants").doc(tenantId).collection("dashboard").doc("stats");
    
    await statsRef.set({
      [type]: FieldValue.increment(amount), // خودکار +1 یا -1 کرے گا
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
    
    console.log(`Successfully updated ${type} by ${amount} for tenant ${tenantId}`);
  } catch (error) {
    console.error("Failed to update tenant stats:", error);
  }
}
