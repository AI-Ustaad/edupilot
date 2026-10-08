// lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { clientEnv } from "@/lib/env.client";

function getValidatedFirebaseConfig() {
  const missing: string[] = [];
  if (!clientEnv.apiKey) missing.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  if (!clientEnv.projectId) missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  if (!clientEnv.authDomain) missing.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  if (!clientEnv.appId) missing.push("NEXT_PUBLIC_FIREBASE_APP_ID");

  if (missing.length > 0) {
    throw new Error(
      `Firebase client configuration error: Missing required environment variables: ${missing.join(
        ", "
      )}. Please configure valid client credentials in your environment.`
    );
  }

  return {
    apiKey: clientEnv.apiKey,
    authDomain: clientEnv.authDomain,
    projectId: clientEnv.projectId,
    storageBucket: clientEnv.storageBucket,
    messagingSenderId: clientEnv.messagingSenderId,
    appId: clientEnv.appId,
  };
}

const config = getValidatedFirebaseConfig();

const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(config);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export default app;
