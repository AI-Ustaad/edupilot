// repositories/settings.repository.ts
import { adminDb } from "@/lib/firebase-admin";

export class SettingsRepository {
  private getSettingsRef(tenantId: string, docId: string) {
    return adminDb.collection("tenants").doc(tenantId).collection("settings").doc(docId);
  }

  async getConfig(tenantId: string): Promise<Record<string, any> | null> {
    const doc = await this.getSettingsRef(tenantId, "config").get();
    return doc.exists ? doc.data() : null;
  }

  async updateConfig(tenantId: string, data: Record<string, any>): Promise<void> {
    await this.getSettingsRef(tenantId, "config").set(
      { ...data, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  }

  async getGeneral(tenantId: string): Promise<Record<string, any> | null> {
    const doc = await this.getSettingsRef(tenantId, "general").get();
    return doc.exists ? doc.data() : null;
  }

  async updateGeneral(tenantId: string, data: Record<string, any>): Promise<void> {
    await this.getSettingsRef(tenantId, "general").set(
      { ...data, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  }
}
