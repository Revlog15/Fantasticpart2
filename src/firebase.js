// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBg6OAYOv-YesSrexNQuO2ZHBSeS89nOkU",
    authDomain: "fantastic4games-87777.firebaseapp.com",
    projectId: "fantastic4games-87777",
    storageBucket: "fantastic4games-87777.firebasestorage.app",
    messagingSenderId: "109578981028",
    appId: "1:109578981028:web:e6df8308deb3484edd6031"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
