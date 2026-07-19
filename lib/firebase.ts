// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { clientEnv } from "@/lib/env";

const app = getApps().length > 0 ? getApp() : initializeApp(clientEnv);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
