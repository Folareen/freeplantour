// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBbWuYU_TmV0eqbzzbpGdxmlLVeFQCQxBQ",
  authDomain: "freeplantour.firebaseapp.com",
  projectId: "freeplantour",
  storageBucket: "freeplantour.appspot.com",
  messagingSenderId: "303816064772",
  appId: "1:303816064772:web:4db000ef7dddbd13989a51",
  measurementId: "G-Z2NYDY6Z6V"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)