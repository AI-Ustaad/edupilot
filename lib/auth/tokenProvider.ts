// lib/auth/tokenProvider.ts
import { getAuth } from "firebase/auth";

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
      console.error("[TokenProvider] Error getting token:", error);
      return null;
    }
  },
};
