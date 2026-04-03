// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCGAp4gOdmzXSkNlXR18RjKtZPwWEMfP64",
  authDomain: "edupilot-d262f.firebaseapp.com",
  projectId: "edupilot-d262f",
  storageBucket: "edupilot-d262f.firebasestorage.app",
  messagingSenderId: "1032307682046",
  appId: "1:1032307682046:web:eb32d969227210c4f293af",
  measurementId: "G-D62QEZQG4C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
