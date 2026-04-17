// /lib/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔐 Firebase Config (From your screenshot)
const firebaseConfig = {
  apiKey: "AIzaSyCGA p4g0dmzXSkNlXR18RjKtZPwWEMfP64".replace(" ", ""),
  authDomain: "edupilot-d262f.firebaseapp.com",
  projectId: "edupilot-d262f",
  storageBucket: "edupilot-d262f.firebasestorage.app",
  messagingSenderId: "1032307682046",
  appId: "1:1032307682046:web:eb32d969227210c4f293af",
  measurementId: "G-D62QEZQG4C",
};

// 🔥 Prevent multiple app initialization (VERY IMPORTANT)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 🔐 Auth
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// 🗄️ Firestore
export const db = getFirestore(app);

// 📊 (Optional) Analytics — only if needed
// import { getAnalytics } from "firebase/analytics";
// export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;
