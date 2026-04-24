import * as admin from "firebase-admin";

// 🔐 Fix multiline private key issue (VERY IMPORTANT for Vercel)
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  : undefined;

// 🚀 Initialize Firebase Admin ONLY ONCE
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
}

// 🔑 Auth + Database exports
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
