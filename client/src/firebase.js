// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, RecaptchaVerifier } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAJCgpoNfjLj9aKIMLpNX7V6h78B6kr68Y",
  authDomain: "umchan-c2fa3.firebaseapp.com",
  projectId: "umchan-c2fa3",
  storageBucket: "umchan-c2fa3.firebasestorage.app",
  messagingSenderId: "537881686160",
  appId: "1:537881686160:web:d91569745748c205bb6815",
  measurementId: "G-GQBV4S22K8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);