// services/featureFlag.service.ts
import { adminDb } from '@/lib/firebase-admin';
import { ALL_FEATURES, Feature } from '@/lib/features/featureFlags';

const COLLECTION = 'tenantFeatures';

export class FeatureFlagService {
  /**
   * Check if a specific feature is enabled for a given tenant.
   */
  async canUse(tenantId: string, feature: Feature): Promise<boolean> {
    const doc = await adminDb.collection(COLLECTION).doc(tenantId).get();
    if (!doc.exists) return true; // no restrictions → all features on

    const data = doc.data();
    const features = data?.features || {};
    // If the feature key is explicitly set to false, it's disabled.
    return features[feature] !== false;
  }

  /**
   * Enable or disable a feature for a tenant.
   */
  async setFeature(tenantId: string, feature: Feature, enabled: boolean): Promise<void> {
    const ref = adminDb.collection(COLLECTION).doc(tenantId);
    await ref.set(
      {
        features: {
          [feature]: enabled,
        },
      },
      { merge: true }
    );
  }

  /**
   * Return all feature flags for a tenant as a record (e.g., { videoLectures: true, transport: false }).
   */
  async getAllFlags(tenantId: string): Promise<Record<string, boolean>> {
    const doc = await adminDb.collection(COLLECTION).doc(tenantId).get();
    if (!doc.exists) return {};
    return doc.data()?.features || {};
  }
}
