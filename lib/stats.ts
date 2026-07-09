import { adminDb } from "@/lib/firebase-admin";
import { logger } from "@/lib/logger/logger";

export async function updateTenantStats(
  tenantId: string, 
  type: 'students' | 'staff' | 'revenue', 
  amount: number
) {
  const statsRef = adminDb.collection("tenants").doc(tenantId).collection("dashboard").doc("stats");
  
  try {
    await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(statsRef);
      
      if (!doc.exists) {
        transaction.set(statsRef, {
          students: type === 'students' ? amount : 0,
          staff: type === 'staff' ? amount : 0,
          revenue: type === 'revenue' ? amount : 0,
          updatedAt: new Date().toISOString()
        });
      } else {
        const currentData = doc.data() || {};
        const currentValue = currentData[type] || 0;
        
        transaction.update(statsRef, {
          [type]: currentValue + amount,
          updatedAt: new Date().toISOString()
        });
      }
    });
    
    logger.info(`Transaction successful: ${type} updated by ${amount} for tenant ${tenantId}`);
  } catch (error) {
    logger.error("Transaction failed:", { metadata: { error } });
    throw error;
  }
}
