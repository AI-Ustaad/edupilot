import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function getSessionUser() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  if (!sessionCookie) return null;

  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userData?.role || 'teacher',
      tenantId: userData?.tenantId,
      onboardingRequired: userData?.onboardingRequired || false,
    };
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}
