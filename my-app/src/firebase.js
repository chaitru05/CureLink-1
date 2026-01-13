// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB6KPk4vKRqHSRpWNNq0Lv8GSK88OMIpJI",
  authDomain: "curelink-6b5f9.firebaseapp.com",
  projectId: "curelink-6b5f9",
  storageBucket: "curelink-6b5f9.firebasestorage.app",
  messagingSenderId: "475634768854",
  appId: "1:475634768854:web:1cf9d7f25cdb0d63526277",
  measurementId: "G-HC2E9JM1H9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
