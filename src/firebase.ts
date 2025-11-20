// FILE: src/firebase.ts
// Firebase is no longer used in this application.
// This file is kept to prevent import errors in any remaining components that might reference it.
// It effectively disables all Firebase functionality.

export const isFirebaseConfigured = false;
export const functions = undefined;
export const db = undefined;
export const firebaseInitError = "Firebase is not used in this application. Running in local proxy mode.";
