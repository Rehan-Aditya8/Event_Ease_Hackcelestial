// /js/firebase.js

// Import Firebase SDKs (modular version)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js";

// Firebase configuration from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBfw6muBM6Pde0q-Rd1ohfRE4H2h-o7fZE",
  authDomain: "eventease-3c369.firebaseapp.com",
  projectId: "eventease-3c369",
  storageBucket: "eventease-3c369.firebasestorage.app",
  messagingSenderId: "19406769442",
  appId: "1:19406769442:web:8e7a6bd76f2ae3b0fb297b",
  measurementId: "G-4JC6RRYW31"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export so you can use in other files
export { auth, db, storage, analytics };


