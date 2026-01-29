// config.js
// --------------------------------------------------------------
// This file initializes the connection to Firebase.
// It exports 'auth' and 'db' so other HTML files can use them.
// --------------------------------------------------------------

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCE_C6R4EyV7hip1yYrOaTzYac9Wrwh5Ys",
    authDomain: "eastlink-web.firebaseapp.com",
    projectId: "eastlink-web"
    // Add storageBucket, messagingSenderId, appId here if you use Storage or Analytics later
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
const auth = getAuth(app);
const db = getFirestore(app);

// Export instances to be used in HTML files
export { app, auth, db };
