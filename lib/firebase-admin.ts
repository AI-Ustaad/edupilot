import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

export function initAdmin() {
  if (getApps().length === 0) {
    // Check if running in production (Vercel) or development
    if (process.env.FIREBASE_PRIVATE_KEY) {
      app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      // For development without service account (uses default credentials)
      app = initializeApp();
    }
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);
  auth = getAuth(app);
  return { db, auth };
}

export function getFirestoreAdmin(): Firestore {
  if (!db) initAdmin();
  return db!;
}

export function getAuthAdmin(): Auth {
  if (!auth) initAdmin();
  return auth!;
}
