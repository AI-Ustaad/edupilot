// lib/env.server.ts

function getServerEnv(value: string | undefined, fallback = ""): string {
  if (!value || value.trim() === "") return fallback;
  return value;
}

export const serverEnv = {
  projectId: getServerEnv(process.env.FIREBASE_PROJECT_ID, process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "edupilot-d262f"),
  clientEmail: getServerEnv(process.env.FIREBASE_CLIENT_EMAIL),
  privateKey: getServerEnv(process.env.FIREBASE_PRIVATE_KEY)?.replace(/\\n/g, "\n"),
  storageBucket: getServerEnv(process.env.FIREBASE_STORAGE_BUCKET, process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "edupilot-d262f.appspot.com"),
};
