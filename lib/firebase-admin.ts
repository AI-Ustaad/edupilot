import * as admin from 'firebase-admin';

// Safely format the private key to handle newline characters.
// This is a crucial step for deployments on platforms like Vercel or Netlify.
const formatPrivateKey = (key?: string) => {
  if (!key) return undefined;
  return key.replace(/\\n/g, '\n');
};

// Singleton pattern to prevent re-initialization errors in Next.js development mode
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
      }),
    });
    console.log('Firebase Admin initialized successfully.');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

// Export the auth module for verifying ID tokens in Route Handlers or Server Actions
export const adminAuth = admin.auth();

// You can also export other services here if needed in the future
// export const adminDb = admin.firestore();
