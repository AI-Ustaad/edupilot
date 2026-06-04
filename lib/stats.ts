// lib/stats.ts
import { adminDb } from "@/lib/firebase-admin";

export async function updateTenantStats(
  tenantId: string, 
  type: 'students' | 'staff' | 'revenue', 
  amount: number
) {
  const statsRef = adminDb.collection("tenants").doc(tenantId).collection("dashboard").doc("stats");
  
  try {
    // Race Conditions سے بچنے کے لیے Transaction کا استعمال
    await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(statsRef);
      
      if (!doc.exists) {
        // اگر ڈاکومنٹ موجود نہیں تو نیا بنائیں
        transaction.set(statsRef, {
          students: type === 'students' ? amount : 0,
          staff: type === 'staff' ? amount : 0,
          revenue: type === 'revenue' ? amount : 0,
          updatedAt: new Date().toISOString()
        });
      } else {
        // محفوظ طریقے سے موجودہ ویلیو میں اضافہ یا کمی کریں
        const currentData = doc.data() || {};
        const currentValue = currentData[type] || 0;
        
        transaction.update(statsRef, {
          [type]: currentValue + amount,
          updatedAt: new Date().toISOString()
        });
      }
    });
    
    console.log(`Transaction successful: ${type} updated by ${amount} for tenant ${tenantId}`);
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error; // تاکہ کال کرنے والی API کو بھی ایرر کا پتہ چل سکے
  }
}
