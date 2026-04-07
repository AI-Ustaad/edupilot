import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  
  // Vercel Formatting Fix: فالتو کوٹس (Quotes) ہٹاتا ہے اور \n کو درست کرتا ہے
  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n').replace(/"/g, '');
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
