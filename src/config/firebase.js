import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBHU98YGyRaR4r5gFiifh4Y0YOmeEb1c-s",
  authDomain: "app-pkhtapin.firebaseapp.com",
  databaseURL: "https://app-pkhtapin-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "app-pkhtapin",
  storageBucket: "app-pkhtapin.firebasestorage.app",
  messagingSenderId: "865931601436",
  appId: "1:865931601436:web:41556effd4be3dad4a21d9"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);