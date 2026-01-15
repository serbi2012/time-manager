// Firebase 설정 파일
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA0lZIaII1T18jX6lKygATpRr6ChJ4W-dU",
  authDomain: "timer-manager-f54b1.firebaseapp.com",
  projectId: "timer-manager-f54b1",
  storageBucket: "timer-manager-f54b1.firebasestorage.app",
  messagingSenderId: "993376896770",
  appId: "1:993376896770:web:f1b1d71d9c0117fa9be41b",
  measurementId: "G-BTMH0B061B"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Auth 인스턴스
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore 인스턴스
export const db = getFirestore(app);

export default app;
