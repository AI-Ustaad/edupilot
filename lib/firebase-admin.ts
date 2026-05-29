import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';

let app: App | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let storage: Storage | undefined;

function initAdmin() {
  if (getApps().length === 0) {
    if (process.env.FIREBASE_PRIVATE_KEY) {
      app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    } else {
      // fallback for development (e.g., emulator)
      app = initializeApp();
    }
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
  return { db, auth, storage };
}

// Named exports – یہی وہ چیزیں ہیں جو آپ کی API routes استعمال کر رہی ہیں
export const adminDb = (() => {
  if (!db) initAdmin();
  return db!;
})();

export const adminAuth = (() => {
  if (!auth) initAdmin();
  return auth!;
})();

export const adminStorage = (() => {
  if (!storage) initAdmin();
  return storage!;
})();

export const dbTimestamp = FieldValue.serverTimestamp();

// اگر کہیں initAdmin() بطور فنکشن چاہیے تو یہ بھی دے دیں
export { initAdmin };
