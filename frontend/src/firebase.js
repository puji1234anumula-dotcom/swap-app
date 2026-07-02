import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDH66hqWrur0Qx8lRl101QS6nCMot41x6M",
  // ✅ Use our own domain as authDomain so Firebase redirect can read back session
  // Vercel proxies /__/auth/* → https://swap-29f1e.firebaseapp.com/__/auth/*
  authDomain: "swap-app-delta.vercel.app",
  projectId: "swap-29f1e",
  storageBucket: "swap-29f1e.firebasestorage.app",
  messagingSenderId: "431994282477",
  appId: "1:431994282477:web:9dada3660af6ceb95107e4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
