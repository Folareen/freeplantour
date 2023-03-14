// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyClHr8tSkk1GkKPwr8TJofQy6Cn-nFkOPc",
  authDomain: "freeplantour-17c73.firebaseapp.com",
  projectId: "freeplantour-17c73",
  storageBucket: "freeplantour-17c73.appspot.com",
  messagingSenderId: "87935379683",
  appId: "1:87935379683:web:210e743a7475b02f477dd6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)