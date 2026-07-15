import { adminDb } from "@/lib/firebase/admin"; // 🟢 اپنے پروجیکٹ کے مطابق امپورٹ پاتھ چیک کر لیجیے گا
import { MasterSchoolConfiguration } from "@/types/configuration";

export class ConfigurationRepository {
  private db = adminDb;

  /**
   * 🟢 موجودہ (Active/Current) اسکول کنفیگریشن لانے کے لیے
   */
  async getActiveConfiguration(tenantId: string): Promise<MasterSchoolConfiguration | null> {
    const doc = await this.db
      .collection("tenants")
      .doc(tenantId)
      .collection("configuration")
      .doc("current")
      .get();

    if (!doc.exists) {
      return null;
    }

    return doc.data() as MasterSchoolConfiguration;
  }

  /**
   * 🟢 اسکول کنفیگریشن کو سیو اور پبلش کرنے کے لیے (Upsert Pattern کے ساتھ)
   */
  async saveConfiguration(tenantId: string, config: MasterSchoolConfiguration): Promise<void> {
    const batch = this.db.batch();
    
    // 1. Save to current SSOT (Single Source of Truth)
    const currentRef = this.db
      .collection("tenants")
      .doc(tenantId)
      .collection("configuration")
      .doc("current");
    batch.set(currentRef, config);

    // 2. Save to History (Git Style Versioning - آڈٹ اور رول بیک کے لیے)
    const historyRef = this.db
      .collection("tenants")
      .doc(tenantId)
      .collection("config_history")
      .doc(`v${config.version.number}`);
    batch.set(historyRef, config);

    // 3. Update Tenant Meta 
    // 🔥 PERMANENT FIX: .set(..., { merge: true }) کا استعمال تاکہ اگر ڈاکومنٹ موجود نہ ہو تو بن جائے
    const tenantRef = this.db.collection("tenants").doc(tenantId);
    batch.set(tenantRef, { 
      status: config.state === "Published" ? "active" : "configuring",
      configVersion: config.version.number,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // تمام تبدیلیاں ایک ہی ٹرانزیکشن میں سیو کریں (تاکہ ڈیٹا کرپٹ نہ ہو)
    await batch.commit();
  }

  /**
   * 🟢 پرانی ہسٹری (Versions) دیکھنے کے لیے (مستقبل کے استعمال کے لیے)
   */
  async getConfigurationHistory(tenantId: string): Promise<MasterSchoolConfiguration[]> {
    const snapshot = await this.db
      .collection("tenants")
      .doc(tenantId)
      .collection("config_history")
      .orderBy("version.createdAt", "desc")
      .get();

    return snapshot.docs.map(doc => doc.data() as MasterSchoolConfiguration);
  }
}
