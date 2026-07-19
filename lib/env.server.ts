// lib/env.server.ts

export const serverEnv = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
};
