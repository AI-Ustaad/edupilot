import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
import { IConfigurationRepository } from "@/interfaces/IConfigurationRepository";
import { MasterSchoolConfiguration } from "@/types/configuration";
import { mapToMasterConfiguration } from "@/lib/mappers/configuration.mapper";

export class ConfigurationRepository implements IConfigurationRepository {
  private getConfigRef(tenantId: string, docId: string) {
    return adminDb.collection("tenants").doc(tenantId).collection("settings").doc(docId);
  }

  async getConfig(tenantId: string): Promise<MasterSchoolConfiguration | null> {
    const doc = await this.getConfigRef(tenantId, "config").get();
    if (!doc.exists) return null;
    return mapToMasterConfiguration(doc.data(), tenantId);
  }

  async updateConfig(tenantId: string, data: Record<string, any>): Promise<void> {
    await this.getConfigRef(tenantId, "config").set(
      { ...data, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  }

  async getGeneral(tenantId: string): Promise<Record<string, any> | null> {
    const doc = await this.getConfigRef(tenantId, "general").get();
    return doc.exists ? (doc.data() as Record<string, any>) : null;
  }

  async updateGeneral(tenantId: string, data: Record<string, any>): Promise<void> {
    await this.getConfigRef(tenantId, "general").set(
      { ...data, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  }

  async getActiveConfiguration(tenantId: string): Promise<MasterSchoolConfiguration | null> {
    return this.getConfig(tenantId);
  }

  async saveConfiguration(tenantId: string, data: Record<string, any>): Promise<void> {
    await this.updateConfig(tenantId, data);
  }

  async getConfigurationHistory(tenantId: string): Promise<MasterSchoolConfiguration[]> {
    const snapshot = await adminDb
      .collection("tenants")
      .doc(tenantId)
      .collection("settings")
      .orderBy("updatedAt", "desc")
      .get();
    
    return snapshot.docs.map(doc => mapToMasterConfiguration(doc.data(), tenantId));
  }
}
