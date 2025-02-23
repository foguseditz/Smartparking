import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0ndrIdgDuNpasMNzPVcnYrATRGJhr-Bg",
  authDomain: "smart-parking-e924d.firebaseapp.com",
  databaseURL: "https://smart-parking-e924d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-parking-e924d",
  storageBucket: "smart-parking-e924d.firebasestorage.app",
  messagingSenderId: "917011354794",
  appId: "1:917011354794:web:8fa1b1292f3a76b222acd3"
};

// Initialize Firebase only if it hasn't been initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, app };
export const storage = getStorage(app);