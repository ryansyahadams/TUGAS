// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5Gn_qJiM1goHmfjj6Ll5Fj1vBpMd4b50",
  authDomain: "dbobat-216e6.firebaseapp.com",
  projectId: "dbobat-216e6",
  storageBucket: "dbobat-216e6.firebasestorage.app",
  messagingSenderId: "568387318164",
  appId: "1:568387318164:web:528e127dbeac1d62d21f81"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
//const analytics = getAnalytics(app);