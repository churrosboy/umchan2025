// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, RecaptchaVerifier } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB3JxS8YGU7CY59YTa6kcR_Bwwnwz1UC_U",
  authDomain: "umchan-d9dd1.firebaseapp.com",
  projectId: "umchan-d9dd1",
  storageBucket: "umchan-d9dd1.firebasestorage.app",
  messagingSenderId: "474380891679",
  appId: "1:474380891679:web:ccc89fc2ef085ef18e872a",
  measurementId: "G-LX1F7B9Q0W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);