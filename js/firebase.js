/* ---------------------------------------------------
   Firebase Initialization
   Uses Realtime Database + Auth + Analytics
--------------------------------------------------- */

// js/firebase.js
// Centralized Firebase initialization (modular SDK)
// Uses your provided Firebase config (corrected storageBucket)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyAcKvgZmmKbptg-5chN098wTBHwh1DX6t4",
  authDomain: "timetracking-5523a.firebaseapp.com",
  databaseURL: "https://timetracking-5523a-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "timetracking-5523a",
  storageBucket: "timetracking-5523a.appspot.com",
  messagingSenderId: "841148659774",
  appId: "1:841148659774:web:733cdb28ae1fee2cc4f96f",
  measurementId: "G-4TTB2Y5VZE"
};

const app = initializeApp(firebaseConfig);
// analytics optional (may fail on localhost if not configured)
let analytics;
try { analytics = getAnalytics(app); } catch(e){ /* ignore in dev */ }

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getDatabase(app);
export default app;
