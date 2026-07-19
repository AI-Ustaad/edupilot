// repositories/configuration.repository.ts
import { adminDb } from "@/lib/firebase-admin"; 
import { MasterSchoolConfiguration } from "@/types/configuration";
import { mapToMasterConfiguration } from "@/lib/mappers/configuration.mapper";

export class ConfigurationRepository {
  private db = adminDb;

  async getActiveConfiguration(tenantId: string): Promise<MasterSchoolConfiguration | null> {
    const doc = await this.db
      .collection("tenants")
      .doc(tenantId)
      .collection("configuration")
      .doc("current")
      .get();

    if (!doc.exists) return null;

    // Rule: Mapping raw DB data to Domain Model happens right here
    return mapToMasterConfiguration(doc.data(), tenantId);
  }

  async saveConfiguration(tenantId: string, config: MasterSchoolConfiguration): Promise<void> {
    const batch = this.db.batch();
    
    // Save to current SSOT
    const currentRef = this.db
      .collection("tenants")
      .doc(tenantId)
      .collection("configuration")
      .doc("current");
    batch.set(currentRef, config);

    // Save to History
    const historyRef = this.db
      .collection("tenants")
      .doc(tenantId)
      .collection("config_history")
      .doc(`v${config.version.number}`);
    batch.set(historyRef, config);

    // Update Tenant Meta
    const tenantRef = this.db.collection("tenants").doc(tenantId);
    batch.set(tenantRef, { 
      status: config.state === "Published" ? "active" : "configuring",
      configVersion: config.version.number,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    await batch.commit();
  }

  async getConfigurationHistory(tenantId: string): Promise<MasterSchoolConfiguration[]> {
    const snapshot = await this.db
      .collection("tenants")
      .doc(tenantId)
      .collection("config_history")
      .orderBy("version.createdAt", "desc")
      .get();

    return snapshot.docs.map(doc => mapToMasterConfiguration(doc.data(), tenantId));
  }
}
