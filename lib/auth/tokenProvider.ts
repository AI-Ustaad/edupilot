// lib/auth/tokenProvider.ts
import { getAuth } from "firebase/auth";
import { logger } from "@/lib/logger/logger";

export interface TokenProvider {
  getAccessToken(forceRefresh?: boolean): Promise<string | null>;
}

// 🚀 Firebase Implementation
export const firebaseTokenProvider: TokenProvider = {
  async getAccessToken(forceRefresh = false) {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        return await currentUser.getIdToken(forceRefresh);
      }
      return null;
    } catch (error) {
      logger.error("[TokenProvider] Error getting token:", { metadata: { error } });
      return null;
    }
  },
};
