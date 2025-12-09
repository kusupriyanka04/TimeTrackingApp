// js/auth.js
// Authentication helpers: email/password + Google + state watcher + guard

import { auth, googleProvider } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

/**
 * registerUser(email, password)
 */
export async function registerUser(email, password) {
  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    // redirect on success
    window.location.href = "index.html";
  } catch (err) {
    alert("Signup failed: " + err.message);
  }
}

/**
 * loginUser(email, password)
 */
export async function loginUser(email, password) {
  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "index.html";
  } catch (err) {
    alert("Login failed: " + err.message);
  }
}

/**
 * googleLogin()
 */
export async function googleLogin() {
  try {
    await signInWithPopup(auth, googleProvider);
    window.location.href = "index.html";
  } catch (err) {
    alert("Google login failed: " + err.message);
  }
}

/**
 * logoutUser()
 */
export async function logoutUser() {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (err) {
    console.error("Logout failed", err);
  }
}

/**
 * onUserState(callback)
 * callback receives (user) object or null
 */
export function onUserState(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * requireAuth()
 * Redirects to login if no user
 */
export function requireAuth() {
  return onAuthStateChanged(auth, user => {
    if (!user) {
      window.location.href = "login.html";
    }
  });
}
