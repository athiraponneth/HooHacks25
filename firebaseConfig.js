// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Replace with your Firebase project credentials
const firebaseConfig = {
    apiKey: "AIzaSyA_M5VJQB_Or6V78UAJ1Jl1CewDofab2tU",
    authDomain: "hoohacks25-d032a.firebaseapp.com",
    projectId: "hoohacks25-d032a",
    storageBucket: "hoohacks25-d032a.firebasestorage.app",
    messagingSenderId: "1001725251327",
    appId: "1:1001725251327:web:de5fec595b9c11e2b606ca",
    measurementId: "G-5QT2WYL27T"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
