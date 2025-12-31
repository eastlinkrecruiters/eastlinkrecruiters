// Firebase Init Module - Requires HTML <script type="module" src="https://www.gstatic.com/firebasejs/12.6.0/firebase-app-compat.js"></script> etc. for compat if needed
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js';
import { getMessaging } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging.js';

// Config from earlier
const firebaseConfig = {
  apiKey: "AIzaSyCNZpgX7yDvlDsJVcyvCqWXBXuABbgItkQ",
  authDomain: "eastlink-recruiters.firebaseapp.com",
  projectId: "eastlink-recruiters",
  storageBucket: "eastlink-recruiters.firebasestorage.app",
  messagingSenderId: "176058975790",
  appId: "1:176058975790:web:fe404a908334a6482241bf",
  measurementId: "G-EXBL55FKRK"
};

// Init
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const messaging = getMessaging(app);

// Export for other modules
window.FirebaseApp = { app, analytics, auth, db, storage, messaging }; // Global for non-module files
export { app, analytics, auth, db, storage, messaging };
