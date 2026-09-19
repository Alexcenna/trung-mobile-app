import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAK1nRnQ61HiwcIJJGb_K8wEGKWyJXnjZM",
  authDomain: "trung-mobile-app.firebaseapp.com",
  projectId: "trung-mobile-app",
  storageBucket: "trung-mobile-app.firebasestorage.app",
  messagingSenderId: "325955904203",
  appId: "1:325955904203:web:00150e4548c6fb9728314e",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);