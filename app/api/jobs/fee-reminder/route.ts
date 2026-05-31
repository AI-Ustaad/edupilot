import { NextResponse } from 'next/server';
import { verifyQStashSignature } from '@/lib/qstash-verify'; // نیچے بنائیں گے
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  // QStash signature verify (optional but recommended)
  // await verifyQStashSignature(req);

  // تمام overdue fees ڈھونڈیں
  const snapshot = await adminDb.collection('fees')
    .where('dueDate', '<', new Date())
    .where('status', '==', 'pending')
    .get();

  // ہر ایک کے لیے ای میل یا اطلاع بھیجیں (یہاں صرف لاگ کر رہے ہیں)
  for (const doc of snapshot.docs) {
    console.log(`Reminder: Fee pending for ${doc.data().studentName}`);
    // TODO: send email / notification
  }

  return NextResponse.json({ success: true, processed: snapshot.size });
}
