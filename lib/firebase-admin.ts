import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore"; // 👈 نیا اضافہ (ڈیٹا بیس امپورٹ)

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // یہ لائن بالکل پرفیکٹ ہے، یہ Vercel کے \n کو خود ٹھیک کر دے گی
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"), 
};

const app =
  getApps().length === 0
    ? initializeApp({
        credential: cert(serviceAccount),
      })
    : getApps()[0];

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app); // 👈 نیا اور سب سے اہم اضافہ (اس کے بغیر ڈیش بورڈ نہیں چلے گا)
