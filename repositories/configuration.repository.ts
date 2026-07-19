import { adminDb } from "@/lib/firebase-admin"; 
import { MasterSchoolConfiguration } from "@/types/configuration";
import { mapToMasterConfiguration, mapToDbDocument } from "@/lib/mappers/configuration.mapper";

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
    return mapToMasterConfiguration(doc.data(), tenantId);
  }

  async saveConfiguration(tenantId: string, config: MasterSchoolConfiguration): Promise<void> {
    const batch = this.db.batch();
    const dbData = mapToDbDocument(config);

    // 1. Save to current SSOT
    const currentRef = this.db
      .collection("tenants")
      .doc(tenantId)
      .collection("configuration")
      .doc("current");
    batch.set(currentRef, dbData);

    // 2. Save to History
    const historyRef = this.db
      .collection("tenants")
      .doc(tenantId)
      .collection("config_history")
      .doc(`v${config.version.number}`);
    batch.set(historyRef, dbData);

    // 3. Update Tenant Meta
    const tenantRef = this.db.collection("tenants").doc(tenantId);
    batch.set(tenantRef, { 
      status: config.state === "Published" ? "active" : "configuring",
      configVersion: config.version.number,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // 🚀 CRITICAL FIX: Sync Classes & Sections to 'classes' collection!
    // Delete old classes for this tenant to avoid duplicates
    const oldClassesSnap = await this.db.collection("classes").where("tenantId", "==", tenantId).get();
    oldClassesSnap.forEach(doc => batch.delete(doc.ref));

    // Insert new classes and sections
    config.academic.classes.forEach((cls: any) => {
      config.academic.sectionNames.forEach((sectionName: string) => {
        const newClassRef = this.db.collection("classes").doc();
        batch.set(newClassRef, {
          tenantId: tenantId,
          classGrade: cls.name,
          sectionName: sectionName,
          subjects: cls.subjects || [],
          createdAt: new Date().toISOString()
        });
      });
    });

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
