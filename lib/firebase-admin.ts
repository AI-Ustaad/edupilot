// lib/firebase-admin.ts
import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';
import { serverEnv } from '@/lib/env.server'; // 🟢 یہ تبدیلی ضروری ہے

let app: App | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let storage: Storage | undefined;

function initAdmin() {
  if (getApps().length === 0) {
    if (serverEnv.privateKey && serverEnv.clientEmail) {
      app = initializeApp({
        credential: cert({
          projectId: serverEnv.projectId,
          clientEmail: serverEnv.clientEmail,
          privateKey: serverEnv.privateKey,
        }),
        storageBucket: serverEnv.storageBucket,
      });
    } else {
      app = initializeApp();
    }
  } else {
    app = getApps()[0];
  }
  
  db = getFirestore(app);
  db.settings({ ignoreUndefinedProperties: true });
  auth = getAuth(app);
  storage = getStorage(app);
  
  return { db, auth, storage };
}

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
export { initAdmin };
