// app/api/create-user/route.ts
import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin (تاکہ بار بار انیشلائز نہ ہو)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace \n string with actual newline character for private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.log('Firebase admin initialization error', error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, role, displayName, uid } = body;

    // 1. Firebase Auth میں اکاؤنٹ بنانا
    const userRecord = await admin.auth().createUser({
      uid: uid, // ہم وہی ID استعمال کریں گے جو Firestore میں سیو ہوگی
      email: email,
      password: password,
      displayName: displayName,
    });

    // 2. Role (عہدہ) تفویض کرنا (Custom Claims)
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: role });

    return NextResponse.json({ success: true, uid: userRecord.uid });
  } catch (error: any) {
    console.error("Auth Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
