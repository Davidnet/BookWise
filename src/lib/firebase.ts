// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDPNB2diVhRvUA4pQyXQn6CuF1VjVntS0c",
  authDomain: "bookwise-7k4b9.firebaseapp.com",
  projectId: "bookwise-7k4b9",
  storageBucket: "bookwise-7k4b9.firebasestorage.app",
  messagingSenderId: "217377015847",
  appId: "1:217377015847:web:39f2aa08fb7bdcced3a602"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
