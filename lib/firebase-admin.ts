import * as admin from 'firebase-admin';

// بلڈ ٹائم کریش سے بچنے کے لیے ہم چیک کر رہے ہیں کہ چابی موجود ہے یا نہیں
if (!admin.apps.length && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, ''),
      }),
    });
  } catch (error) {
    console.log('Firebase init skipped during build');
  }
}

// اگر ایپ انیشلائز نہ ہو سکے تو null بھیج دو
export const adminAuth = admin.apps.length > 0 ? admin.auth() : null;
export const adminDb = admin.apps.length > 0 ? admin.firestore() : null;
