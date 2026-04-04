import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCGAp4gOdmzXSkNlXR18RjKtZPwWEMfP64",
  authDomain: "edupilot-d262f.firebaseapp.com",
  projectId: "edupilot-d262f",
  storageBucket: "edupilot-d262f.firebasestorage.app",
  messagingSenderId: "1032307682046",
  appId: "1:1032307682046:web:eb32d969227210c4f293af",
  measurementId: "G-D62QEZQG4C"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
