//client/firebase.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, RecaptchaVerifier } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAxCII36iQrPjf_U8fiEjlW5NQQF6Yy64I",
  authDomain: "umchan-eb63f.firebaseapp.com",
  databaseURL: "https://umchan-eb63f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "umchan-eb63f",
  storageBucket: "umchan-eb63f.firebasestorage.app",
  messagingSenderId: "100958189835",
  appId: "1:100958189835:web:0712649e1eb2d85d620a0e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);