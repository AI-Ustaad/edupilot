// lib/auth/tokenProvider.ts
import { getAuth } from "firebase/auth";

export interface TokenProvider {
  getAccessToken(): Promise<string | null>;
}

// 🚀 Firebase Implementation
export const firebaseTokenProvider: TokenProvider = {
  async getAccessToken() {
    try {
      const auth = getAuth();
    const currentUser = auth.currentUser;
      if (currentUser) {
        return await currentUser.getIdToken();
      }
      return null;
    } catch (error) {
      console.error("[TokenProvider] Error getting token:", error);
      return null;
    }
  },
};
