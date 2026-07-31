// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9Xiiz41Y203qAKXGnkWoEnm4M1EjchtM",
  authDomain: "ujikom-d112f.firebaseapp.com",
  projectId: "ujikom-d112f",
  storageBucket: "ujikom-d112f.firebasestorage.app",
  messagingSenderId: "1079039090628",
  appId: "1:1079039090628:web:d82a018524a7922892ce91"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
//const analytics = getAnalytics(app);