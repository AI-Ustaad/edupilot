// services/featureFlag.service.ts
import { adminDb } from '@/lib/firebase-admin';
import { ALL_FEATURES, Feature } from '@/lib/features/featureFlags';

const COLLECTION = 'tenantFeatures';

export class FeatureFlagService {
  /**
   * Check if a feature is enabled for a given tenant.
   * By default, if no override exists, all features are enabled.
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
   * Set a feature on/off for a tenant.
   */
  async setFeature(tenantId: string, feature: Feature, enabled: boolean): Promise<void> {
    const ref = adminDb.collection(COLLECTION).doc(tenantId);
    await ref.set({
      features: {
        [feature]: enabled,
      },
    }, { merge: true });
  }
}
