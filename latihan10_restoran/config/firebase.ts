// config/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDcQFQsM77Jzcpk1WovQAlUK9GFBy4f6zk",
  authDomain: "dbrestoran-6efaa.firebaseapp.com",
  projectId: "dbrestoran-6efaa",
  storageBucket: "dbrestoran-6efaa.firebasestorage.app",
  messagingSenderId: "15727243719",
  appId: "1:15727243719:web:ec2a3fcf399d5de160e9e2",
  measurementId: "G-L5GLEG2WZL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export db untuk digunakan di file lain
export { db };