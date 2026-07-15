import { adminDb } from "@/lib/firebase-admin";
import { MasterSchoolConfiguration } from "@/types/configuration";

export class ConfigurationRepository {
  private db = adminDb;

  async getActiveConfiguration(tenantId: string): Promise<MasterSchoolConfiguration | null> {
    const doc = await this.db.collection("tenants").doc(tenantId).collection("configuration").doc("current").get();
    if (!doc.exists) return null;
    return doc.data() as MasterSchoolConfiguration;
  }

  async saveConfiguration(tenantId: string, config: MasterSchoolConfiguration): Promise<void> {
    const batch = this.db.batch();
    
    // 1. Save to current SSOT
    const currentRef = this.db.collection("tenants").doc(tenantId).collection("configuration").doc("current");
    batch.set(currentRef, config);

    // 2. Save to History (Git Style Versioning)
    const historyRef = this.db.collection("tenants").doc(tenantId).collection("config_history").doc(`v${config.version.number}`);
    batch.set(historyRef, config);

    // 3. Update Tenant Meta
    const tenantRef = this.db.collection("tenants").doc(tenantId);
    batch.update(tenantRef, { 
      "status": config.state === "Published" ? "active" : "configuring",
      "configVersion": config.version.number,
      "updatedAt": new Date().toISOString()
    });

    await batch.commit();
  }
}
