// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBasORDXiB2uTf0qVi9snueFYdOGkuk7P4",
  authDomain: "naymo-9e4a1.firebaseapp.com",
  projectId: "naymo-9e4a1",
  storageBucket: "naymo-9e4a1.firebasestorage.app",
  messagingSenderId: "734764754674",
  appId: "1:734764754674:web:230ad4463fa11c0d5a126b",
  measurementId: "G-RQ25NV9VKB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

    
export const db = getFirestore(app);
export const auth = getAuth();
export const storage = getStorage();