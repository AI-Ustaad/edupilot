// test-setup.ts
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_PROJECT_ID = 'demo-test';

// Mock Firebase Admin to use emulator
jest.mock('@/lib/firebase-admin', () => {
  const admin = require('firebase-admin');
  const app = admin.initializeApp({ projectId: 'demo-test' });
  const db = app.firestore();
  db.settings({
    host: 'localhost:8080',
    ssl: false,
  });
  return {
    adminDb: db,
    adminAuth: app.auth(),
    dbTimestamp: admin.firestore.FieldValue.serverTimestamp(),
  };
});
