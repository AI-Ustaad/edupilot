import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXX", // real key
  authDomain: "edupilot-d262f.firebaseapp.com", // EXACT
  projectId: "edupilot-d262f", // EXACT
  storageBucket: "edupilot-d262f.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

// ✅ AUTH
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
