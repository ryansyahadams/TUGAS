// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyACLlGN3VxuD7oGrOnfElAv8AMPCMpazfc",
  authDomain: "crudbioskop-4b0ab.firebaseapp.com",
  projectId: "crudbioskop-4b0ab",
  storageBucket: "crudbioskop-4b0ab.firebasestorage.app",
  messagingSenderId: "973975576846",
  appId: "1:973975576846:web:d85323bebadb842320375f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);