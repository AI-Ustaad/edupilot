import { adminDb } from '@/lib/firebase-admin';
import { ALL_FEATURES, Feature } from '@/lib/features/featureFlags';
import { SubscriptionService } from './subscription.service';

const COLLECTION = 'tenantFeatures';
const subscriptionService = new SubscriptionService();

export class FeatureFlagService {
  // ... existing methods ...

  /**
   * Enhanced canUse: checks both tenant override AND plan limits.
   */
  async canUse(tenantId: string, feature: Feature): Promise<boolean> {
    // 1. Plan must allow the feature
    const planAllows = await subscriptionService.canUseFeature(tenantId, feature);
    if (!planAllows) return false;

    // 2. Check manual override (tenant can disable a feature even if plan allows it)
    const doc = await adminDb.collection(COLLECTION).doc(tenantId).get();
    if (doc.exists) {
      const features = doc.data()?.features || {};
      if (features[feature] === false) return false;   // manual override off
    }

    // 3. Feature must be defined in ALL_FEATURES
    if (!Object.values(ALL_FEATURES).includes(feature)) return true; // if unknown, allow
    return true;
  }
}
