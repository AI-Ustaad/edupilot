// lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { clientEnv } from "@/lib/env.client";

const effectiveConfig = clientEnv.apiKey ? clientEnv : {
  apiKey: "AIzaSy_placeholder_key_for_ssr",
  authDomain: clientEnv.authDomain || "edupilot-d262f.firebaseapp.com",
  projectId: clientEnv.projectId || "edupilot-d262f",
  storageBucket: clientEnv.storageBucket || "edupilot-d262f.appspot.com",
  messagingSenderId: clientEnv.messagingSenderId || "123456789012",
  appId: clientEnv.appId || "1:123456789012:web:placeholder",
};

const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(effectiveConfig);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export default app;
