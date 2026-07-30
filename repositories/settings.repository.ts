// repositories/settings.repository.ts
import { BaseRepository } from "./base.repository";
import type { ISettingsRepository } from "@/interfaces/ISettingsRepository";
import { nowISO } from "@/lib/date";

export class SettingsRepository extends BaseRepository<any> implements ISettingsRepository {
  constructor() {
    super("settings");
  }

  private getSettingsRef(tenantId: string, docId: string) {
    return this.db.collection("tenants").doc(tenantId).collection(this.collectionName).doc(docId);
  }

  async getConfig(tenantId: string): Promise<Record<string, any> | null> {
    const doc = await this.getSettingsRef(tenantId, "config").get();
    return doc.exists ? (doc.data() as Record<string, any>) : null;
  }

  async updateConfig(tenantId: string, data: Record<string, any>): Promise<void> {
    await this.getSettingsRef(tenantId, "config").set(
      { ...data, updatedAt: nowISO() },
      { merge: true }
    );
  }

  async getConfigurationHistory(tenantId: string): Promise<Record<string, any>[]> {
    const snapshot = await this.getSettingsRef(tenantId, "config")
      .collection("history")
      .orderBy("version", "desc")
      .limit(50)
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async saveConfigurationWithHistory(
    tenantId: string,
    configuration: Record<string, any>,
    historyEntry: Record<string, any>
  ): Promise<void> {
    const configRef = this.getSettingsRef(tenantId, "config");
    const batch = this.db.batch();
    batch.set(configRef, { ...configuration, updatedAt: nowISO() }, { merge: true });
    batch.set(configRef.collection("history").doc(), {
      ...historyEntry,
      createdAt: nowISO(),
    });
    await batch.commit();
  }

  async getGeneral(tenantId: string): Promise<Record<string, any> | null> {
    const doc = await this.getSettingsRef(tenantId, "general").get();
    return doc.exists ? (doc.data() as Record<string, any>) : null;
  }

  async updateGeneral(tenantId: string, data: Record<string, any>): Promise<void> {
    await this.getSettingsRef(tenantId, "general").set(
      { ...data, updatedAt: nowISO() },
      { merge: true }
    );
  }
}
