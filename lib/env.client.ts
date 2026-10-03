// lib/env.client.ts

function getEnv(value: string | undefined, name: string, fallback = ""): string {
  if (!value || value.trim() === "") {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[Config Warning] Missing client environment variable: ${name}`);
    }
    return fallback;
  }
  return value;
}

export const clientEnv = {
  apiKey: getEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY, "NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: getEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", "edupilot-d262f.firebaseapp.com"),
  projectId: getEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, "NEXT_PUBLIC_FIREBASE_PROJECT_ID", "edupilot-d262f"),
  storageBucket: getEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", "edupilot-d262f.appspot.com"),
  messagingSenderId: getEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID, "NEXT_PUBLIC_FIREBASE_APP_ID"),
};
